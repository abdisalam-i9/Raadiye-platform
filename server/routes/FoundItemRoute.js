import FoundItem from '../model/FoundItem.js';
import { createListingRouter } from './createListingRouter.js';

export default createListingRouter({
  Model: FoundItem,
  dateField: 'foundDate',
  label: 'found item',
});
