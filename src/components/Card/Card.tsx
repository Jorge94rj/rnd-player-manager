type CardProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  handleEdit?: () => void;
  handleDelete?: () => void;
};

const Card = ({ title, description, children, handleEdit, handleDelete }: CardProps) => {
  return (
    <div className="cursor-pointer flex flex-col border border-white rounded-lg p-4 text-white">
      {children}
      <h3>{title}</h3>
      <div className="h-32 p-2 m-4 overflow-y-auto">{description}</div>
      <div className="w-full flex flex-row justify-end gap-4">
        <button
          className="cursor-pointer px-2 rounded-md border border-secondary hover:bg-secondary"
          onClick={handleEdit}
        >
          Edit
        </button>
        <button
          className="cursor-pointer px-2 rounded-md border border-secondary hover:bg-secondary"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Card;
