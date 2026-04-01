import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageLoader } from "../../../../shared/ui/PageLoader/PageLoader"; // Импорт из Shared
import { publicRoutes, privateRoutes } from "../config/routeConfig";
import { useUserStore } from "../../../../entities/User/model/store/useUserStore";

export const AppRouter = () => {
  const isAuth = useUserStore((state) => state.authData);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {publicRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {isAuth &&
          privateRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
