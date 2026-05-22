import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import type { Persistor } from "redux-persist";
import { persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import authReducer from "../features/auth/auth.slice";
import categoryReducer from "../features/category/category.slice";
import serviceReducer from "../features/service/service.slice";
import staffReducer from "../features/staff/staff.slice";
import inventoryItemReducer from "../features/inventory/inventory-item.slice";
import inventoryLogReducer from "../features/inventory/inventory-log.slice";
import itemsCategoryReducer from "../features/inventory/inventory-items-category.slice";
import bookingReducer from "../features/booking/booking.slice";

const storage = createWebStorage("local");

const rootReducer = combineSlices({
  auth: authReducer,
  category: categoryReducer,
  service: serviceReducer,
  staff: staffReducer,
  inventoryItem: inventoryItemReducer,
  inventoryLog: inventoryLogReducer,
  itemsCategory: itemsCategoryReducer,
  booking: bookingReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export const store = makeStore();
export const persistor: Persistor = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;

export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<ThunkReturnType, RootState, unknown, Action>;
