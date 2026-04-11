// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;

use rfd::FileDialog;
use rnd_player_manager_lib::{scan_drive_command, ScanDriveResponse};
use tauri::{path::BaseDirectory, AppHandle, Manager};

#[tauri::command]
fn pick_folder() -> Result<Option<String>, String> {
    let result = FileDialog::new()
        .set_title("Select folder to scan")
        .pick_folder();
    Ok(result.map(|path| path.to_string_lossy().to_string()))
}

#[tauri::command]
fn pick_export_file() -> Result<Option<String>, String> {
    let result = FileDialog::new()
        .set_title("Export SQLite DB")
        .set_file_name("media.db")
        .add_filter("SQLite Database", &["db", "sqlite", "sqlite3"])
        .save_file();
    Ok(result.map(|path| path.to_string_lossy().to_string()))
}

fn get_internal_db_path(app_handle: &AppHandle) -> Result<String, String> {
    let path = app_handle
        .path()
        .resolve("media.db", BaseDirectory::AppData)
        .map_err(|e| e.to_string())?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_db_path(app_handle: AppHandle) -> Result<String, String> {
    get_internal_db_path(&app_handle)
}

#[tauri::command]
fn scan_drive(app_handle: AppHandle, folder_path: String) -> Result<ScanDriveResponse, String> {
    let db_path = get_internal_db_path(&app_handle)?;
    scan_drive_command(folder_path, db_path)
}

#[tauri::command]
fn export_db(app_handle: AppHandle, destination: String) -> Result<String, String> {
    let source = get_internal_db_path(&app_handle)?;
    if !Path::new(&source).exists() {
        return Err("No internal database file found to export.".into());
    }
    fs::copy(&source, &destination)
        .map_err(|e| e.to_string())
        .map(|_| destination.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            pick_folder,
            pick_export_file,
            get_db_path,
            scan_drive,
            export_db,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
