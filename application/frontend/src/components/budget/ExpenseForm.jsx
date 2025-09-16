function ExpenseForm({ amount, desc, onChangeAmount, onChangeDesc, onAdd }) {
  return (
    <div className="addExpense">
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => onChangeAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description"
        value={desc}
        onChange={(e) => onChangeDesc(e.target.value)}
      />
      <button onClick={onAdd}>Add</button>
    </div>
  );
}

export default ExpenseForm;
