// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use rusqlite::{params, Connection};
use serde::Serialize;
use std::ffi::OsStr;
use std::path::{Path, PathBuf};
use std::process::Command;
use walkdir::WalkDir;

const SUPPORTED_MEDIA: &[&str] = &[
    "AVI", "MPEG", "WMV", "ASF", "FLV", "MKV", "MKA", "MP4", "M4A", "AAC", "NUT", "OGG", "OGM",
    "MOV", "RAM", "RM", "RV", "RA", "RMVB", "3GP", "VIVO", "PVA", "NUV", "NSV", "NSA", "FLI",
    "FLC", "DVR-MS", "WTV", "TRP", "F4V",
];

#[derive(Serialize)]
pub struct ScanDriveResponse {
    failed_files: Vec<String>,
}

fn is_video_file(path: &Path) -> bool {
    path.extension()
        .and_then(OsStr::to_str)
        .map(|ext| SUPPORTED_MEDIA.contains(&ext.to_uppercase().as_str()))
        .unwrap_or(false)
}

fn get_video_duration_minutes(path: &Path) -> Result<i64, ()> {
    let output = Command::new("ffprobe")
        .arg("-v")
        .arg("error")
        .arg("-select_streams")
        .arg("v:0")
        .arg("-show_entries")
        .arg("stream=duration")
        .arg("-of")
        .arg("default=noprint_wrappers=1:nokey=1")
        .arg(path)
        .output()
        .map_err(|_| ())?;

    if !output.status.success() {
        return Err(());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let duration_secs: f64 = stdout.trim().parse().map_err(|_| ())?;
    let duration_mins = (duration_secs / 60.0).floor() as i64;
    Ok(duration_mins)
}

fn update_db(scanned_dirs: &[ScannedDirectory], db_path: &Path) -> Result<(), String> {
    let mut conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute_batch(
        "BEGIN;
        CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            avg_duration INTEGER
        );
        CREATE TABLE IF NOT EXISTS media (
            id INTEGER PRIMARY KEY,
            path TEXT NOT NULL,
            filename TEXT NOT NULL,
            duration INTEGER NOT NULL,
            played INTEGER NOT NULL DEFAULT 0,
            content_id INTEGER NOT NULL
        );
        COMMIT;",
    )
    .map_err(|e| e.to_string())?;

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    tx.execute("DELETE FROM media", [])
        .map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM content", [])
        .map_err(|e| e.to_string())?;

    for dir in scanned_dirs {
        tx.execute(
            "INSERT INTO content(name) VALUES (?)",
            params![dir.dir_name],
        )
        .map_err(|e| e.to_string())?;
        let content_id = tx.last_insert_rowid();

        for file in &dir.files {
            tx.execute(
                "INSERT INTO media(path, filename, duration, played, content_id) VALUES (?, ?, ?, ?, ?)",
                params![file.path, file.filename, file.duration, 0, content_id],
            )
            .map_err(|e| e.to_string())?;
        }

        let avg_duration: f64 = tx
            .query_row(
                "SELECT AVG(duration) FROM media WHERE content_id = ?",
                params![content_id],
                |row| row.get(0),
            )
            .unwrap_or(0.0);

        tx.execute(
            "UPDATE content SET avg_duration = ? WHERE id = ?",
            params![avg_duration.round() as i64, content_id],
        )
        .map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

struct ScannedDirectory {
    dir_name: String,
    files: Vec<ScannedFile>,
}

struct ScannedFile {
    path: String,
    filename: String,
    duration: i64,
}

pub fn scan_drive_command(
    folder_path: String,
    db_path: String,
) -> Result<ScanDriveResponse, String> {
    let root = PathBuf::from(folder_path.clone());
    if !root.exists() {
        return Err("Selected path does not exist.".into());
    }
    if !root.is_dir() {
        return Err("Selected path must be a directory.".into());
    }

    let mut scanned_dirs = Vec::new();
    let mut failed_files = Vec::new();

    for entry in std::fs::read_dir(&root).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let mut scanned_files = Vec::new();
        for item in WalkDir::new(&path).into_iter().filter_map(Result::ok) {
            if !item.file_type().is_file() {
                continue;
            }
            let file_path = item.path();
            if !is_video_file(file_path) {
                continue;
            }

            let duration = get_video_duration_minutes(file_path).unwrap_or(0);
            if duration == 0 {
                failed_files.push(file_path.to_string_lossy().to_string());
                continue;
            }

            let parent = file_path.parent().unwrap_or(file_path);
            let rel_path = parent
                .strip_prefix(&root)
                .unwrap_or(parent)
                .to_string_lossy()
                .to_string();
            let normalized_path = if rel_path.is_empty() {
                "".to_string()
            } else {
                format!("{}/", rel_path.replace('\\', "/"))
            };

            scanned_files.push(ScannedFile {
                path: normalized_path,
                filename: file_path
                    .file_name()
                    .and_then(OsStr::to_str)
                    .unwrap_or_default()
                    .to_string(),
                duration,
            });
        }

        scanned_dirs.push(ScannedDirectory {
            dir_name: entry.file_name().to_string_lossy().to_string(),
            files: scanned_files,
        });
    }

    update_db(&scanned_dirs, &PathBuf::from(db_path))?;
    Ok(ScanDriveResponse { failed_files })
}

// This library exposes helper functions for the Tauri application.
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init()) // Initialize the plugin
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
