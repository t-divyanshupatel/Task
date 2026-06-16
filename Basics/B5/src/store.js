class TransactionStore {
  constructor() {
    this._transactions = [];
    this._nextId = 1;
  }

  reset() {
    this._transactions = [];
    this._nextId = 1;
  }

  create(payload) {
    if (payload.type === "withdrawal" && payload.amount > this.balance) {
      const error = new Error("Insufficient balance for withdrawal");
      error.status = 400;
      throw error;
    }

    const transaction = {
      id: this._nextId,
      amount: payload.amount,
      type: payload.type,
      description: payload.description ?? null,
      created_at: new Date().toISOString(),
    };

    this._nextId += 1;
    this._transactions.push(transaction);
    return transaction;
  }

  listTransactions() {
    return [...this._transactions];
  }

  get balance() {
    const total = this._transactions.reduce((sum, txn) => {
      return txn.type === "deposit" ? sum + txn.amount : sum - txn.amount;
    }, 0);
    return Math.round(total * 100) / 100;
  }

  getBalance() {
    return {
      balance: this.balance,
      transaction_count: this._transactions.length,
    };
  }
}

export const store = new TransactionStore();
