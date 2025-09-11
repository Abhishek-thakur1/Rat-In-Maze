import React, { Suspense } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { appRoutes } from './config/routes';

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {appRoutes.map((route, i) => (
          <Route key={i} path={route.path} element={route.element}>
            {route.children?.map((child, j) => (
              <Route key={j} path={child.path} element={child.element} />
            ))}
          </Route>
        ))}
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </Suspense>
  );
}

export default App;
