import FoundItem from '../model/FoundItem.js';
import LostItem from '../model/LostItem.js';

export async function expireItems() {
  try {
    const found = await FoundItem.updateMany(
      { status: 'active', expiresAt: { $lte: new Date() } },
      { $set: { status: 'expired' } }
    );

    const lost = await LostItem.updateMany(
      { status: 'active', expiresAt: { $lte: new Date() } },
      { $set: { status: 'expired' } }
    );

    console.log(
      `Expired found: ${found.modifiedCount}, lost: ${lost.modifiedCount}`
    );
  } catch (error) {
    console.log('Expire items error:', error);
  }
}
