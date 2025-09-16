function ExpenseList({ expenses, onDelete }) {
  return (
    <ul>
      {expenses.map((e) => (
        <li key={e._id}>
          <div>
            {e.amount} Ft — {e.desc}
          </div>
          <button
            className="deleteItem"
            onClick={() => onDelete(e._id)}
            aria-label={`Delete ${e.desc}`}
          >
            <img src="/trash_icon.png" alt="delete" className="trashIcon" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ExpenseList;
