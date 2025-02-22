import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CContainer, CSpinner } from '@coreui/react';
import { useSelector } from 'react-redux';
import routes from '../routes';

const AppContent = () => {
  const user = useSelector((state) => state.user);

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={
                    user ? (
                      <route.element />
                    ) : (
                      <Navigate to="/admin" replace />
                    )
                  }
                />
              )
            );
          })}
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  );
};

export default React.memo(AppContent);
