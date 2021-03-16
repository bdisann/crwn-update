import { call, all } from "redux-saga/effects";

import { fetchCollectionsStart } from "./shop/shop.sagas";
import userSagas from "./user/user.sagas";
import cartSagas from "./cart/cart.sagas";

const rootSagas = function* () {
  yield all([call(fetchCollectionsStart), call(userSagas), call(cartSagas)]);
};

export default rootSagas;
