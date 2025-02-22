import { resetData } from "../actions/dataAction";
import { resetQRData } from "../actions/qrAction";

export const resetAllData = (dispatch) => {
    dispatch(resetData());
    dispatch(resetQRData());
};
