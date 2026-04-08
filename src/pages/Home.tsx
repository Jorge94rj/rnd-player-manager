import { useState } from "react";
import Card from "../components/Card/Card";
import Modal from "../components/Modal/Modal";

export default function Home() {
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardId, setCardId] = useState<number | null>(null);

  const handleCreateEditModal = (id: number | null) => {
    setCardId(id);
    setIsCreateEditModalOpen(true);
  };

  const handleDeleteModal = (id: number) => {
    setCardId(id);
    setIsDeleteModalOpen(true);
  };

  const handleGroupCreateEdit = () => {
    setCardId(null);
    setIsCreateEditModalOpen(false);
  };

  const handleCardDeleteConfirm = () => {
    setCardId(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <main className="mx-auto px-16 flex flex-col justify-center">
      <div className="flex flex-col gap-4 justify-center items-start">
        <h3 className="text-4xl text-white font-bold">Groups</h3>
        <button
          className="cursor-pointer max-h-8 rounded-lg border border-white px-2 text-white hover:bg-white hover:text-primary"
          onClick={() => handleCreateEditModal(null)}
        >
          Add
        </button>
      </div>
      <section className="w-full mt-12 grid grid-cols-4 gap-4">
        <Card
          title="Group 1 test"
          handleEdit={() => handleCreateEditModal(1)}
          handleDelete={() => handleDeleteModal(1)}
        />
      </section>

      <Modal
        isOpen={isCreateEditModalOpen}
        title={cardId ? "Edit group" : "Create group"}
        onClose={() => setIsCreateEditModalOpen(false)}
      >
        {cardId ? <p>Edit group {cardId}</p> : <p>Create new group</p>}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete group"
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <p>Are you sure you want to delete this group with ID {cardId}?</p>
      </Modal>
    </main>
  );
}
