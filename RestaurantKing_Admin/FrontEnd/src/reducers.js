const initialState = {
    sidebarShow: true,
    theme: 'light',
    user: null,
    sidebarUnfoldable: false,
    data: null,
  };
  
  const changeState = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USER':
        return { ...state, user: action.payload };
      case 'LOGOUT':
        return { ...state, user: null };
      case 'TOGGLE_SIDEBAR':
        return { ...state, sidebarShow: action.payload};
      case 'TOGGLE_SIDEBAR_UNFOLDABLE':
        return { ...state, sidebarUnfoldable: action.payload };
      case 'SET_DATA': 
        return { ...state, data: action.payload};
      default:
        return state;
    }
  };
  
  export default changeState;
  