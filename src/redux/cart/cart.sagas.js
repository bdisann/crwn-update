import { call, takeLatest, put, all } from "redux-saga/effects";
import { UserActionTypes } from "../user/user.types";
import { clearCart } from "./cart.actions";

const clearCartOnSignOutSuccess = function* () {
  yield put(clearCart());
};

const onSignOutSuccess = function* () {
  yield takeLatest(UserActionTypes.SIGN_OUT_SUCCESS, clearCartOnSignOutSuccess);
};

const cartSagas = function* () {
  yield all([call(onSignOutSuccess)]);
};

export default cartSagas;
