// Groups a list of recruits into batches of 12, based on their join order
// (orderInParent). Same logic as the backend's checkAndPromoteToSO,
// but reusable on the frontend for display purposes.
export function groupIntoBatches(members) {
  const sorted = [...members].sort(
    (a, b) => (a.orderInParent || 0) - (b.orderInParent || 0)
  );

  const batches = [];
  sorted.forEach((member) => {
    const batchNumber = Math.ceil((member.orderInParent || 1) / 12) || 1;
    let batch = batches.find((b) => b.batchNumber === batchNumber);
    if (!batch) {
      batch = { batchNumber, members: [] };
      batches.push(batch);
    }
    batch.members.push(member);
  });

  return batches
    .sort((a, b) => a.batchNumber - b.batchNumber)
    .map((b) => ({
      ...b,
      completedCount: b.members.filter((m) => m.hasPurchasedBooks).length,
      isComplete: b.members.length === 1 && b.members.every((m) => m.hasPurchasedBooks)
    }));
}