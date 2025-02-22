export const setUser = (user) => ({
  type: 'SET_USER',
  payload: user,
});

export const logout = () => ({
  type: 'LOGOUT',
});

export const toggleSidebar = (shouldShow) => ({
  type: 'TOGGLE_SIDEBAR',
  payload: shouldShow,
});

export const toggleSidebarUnfoldable = (value) => ({
  type: 'TOGGLE_SIDEBAR_UNFOLDABLE',
  payload: value,
});

export const setData = (data) => ({
  type: 'SET_DATA',
  payload: data,
});