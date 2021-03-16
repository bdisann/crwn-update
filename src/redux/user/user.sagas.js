import { takeLatest, all, call, put } from "redux-saga/effects";

import {
  auth,
  googleProvider,
  createUserProfileDocument,
  getCurrentUser,
} from "../../firebase/firebase.utils";
import {
  signInFailure,
  signInSuccess,
  signOutFailure,
  signOutSuccess,
  signUpSuccess,
} from "./user.actions";

import { UserActionTypes } from "./user.types";

const getSnapshotFromUserAuth = function* (user, additionalData) {
  const userRef = yield call(createUserProfileDocument, user, additionalData);
  const userSnapshot = yield userRef.get();

  yield put(signInSuccess({ id: userSnapshot.id, ...userSnapshot.data() }));
};

// google sign in

const signInWithGoogleProcess = function* () {
  try {
    const { user } = yield auth.signInWithPopup(googleProvider);
    yield getSnapshotFromUserAuth(user);
  } catch (error) {
    yield put(signInFailure(error));
  }
};

const onGoogleSignInStart = function* () {
  yield takeLatest(
    UserActionTypes.GOOGLE_SIGN_IN_START,
    signInWithGoogleProcess
  );
};

// email and password sign in

const emailAndPasswordSignInProccess = function* ({
  payload: { email, password },
}) {
  try {
    const { user } = yield auth.signInWithEmailAndPassword(email, password);
    yield getSnapshotFromUserAuth(user);
  } catch (error) {
    yield put(signInFailure(error));
  }
};

const onEmailAndPasswordSignInStart = function* () {
  yield takeLatest(
    UserActionTypes.EMAIL_SIGN_IN_START,
    emailAndPasswordSignInProccess
  );
};

// user check session persistence

const checkUserSessionProcess = function* () {
  try {
    const userAuth = yield getCurrentUser();
    if (!userAuth) return;
    yield getSnapshotFromUserAuth(userAuth);
  } catch (error) {
    yield put(signInFailure(error));
  }
};

const onCheckUserSession = function* () {
  yield takeLatest(UserActionTypes.CHECK_USER_SESSION, checkUserSessionProcess);
};

// user sign out

const onUserSignOutProccess = function* () {
  try {
    yield auth.signOut();
    yield put(signOutSuccess());
  } catch (error) {
    yield put(signOutFailure(error));
  }
};

const onUserSignOut = function* () {
  yield takeLatest(UserActionTypes.SIGN_OUT_START, onUserSignOutProccess);
};

// on sign up success

const signInAfterSignUp = function* ({ payload: { user, additionalData } }) {
  yield getSnapshotFromUserAuth(user, additionalData);
};

const onSignUpSuccess = function* () {
  yield takeLatest(UserActionTypes.SIGN_UP_SUCCESS, signInAfterSignUp);
};

// user sign up email and password

const userSignUpProccess = function* ({
  payload: { displayName, password, email },
}) {
  try {
    const { user } = yield auth.createUserWithEmailAndPassword(email, password);
    yield put(signUpSuccess({ user, additionalData: { displayName } }));
  } catch (error) {
    console.error(error);
  }
};

const onUserSignUp = function* () {
  yield takeLatest(UserActionTypes.SIGN_UP_START, userSignUpProccess);
};

// root user sagas
const userSagas = function* () {
  yield all([
    call(onGoogleSignInStart),
    call(onEmailAndPasswordSignInStart),
    call(onCheckUserSession),
    call(onUserSignOut),
    call(onUserSignUp),
    call(onSignUpSuccess),
  ]);
};

export default userSagas;
