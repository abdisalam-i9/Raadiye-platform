import LostItem from '../model/LostItem.js';
import { createListingRouter } from './createListingRouter.js';

export default createListingRouter({
  Model: LostItem,
  dateField: 'lostDate',
  label: 'lost item',
});
