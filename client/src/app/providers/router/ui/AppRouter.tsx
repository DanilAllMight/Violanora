import { useUserStore } from "../../../../entities/User/model/store/useUserStore";
import { PageLoader } from "../../../../shared/ui/PageLoader/PageLoader";
import { publicRoutes, privateRoutes } from "../config/routeConfig";
import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

export const AppRouter = () => {
  const isAuth = useUserStore((state) => state.authData);
  const userRole = useUserStore((state) => state.authData?.role) || "USER";

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {publicRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {isAuth &&
          privateRoutes.map(({ path, element, roles }) => {
            if (!roles) {
              return <Route key={path} path={path} element={element} />;
            }

            const hasAccess = roles.includes(userRole);

            return (
              <Route
                key={path}
                path={path}
                element={hasAccess ? element : <Navigate to="/" replace />}
              />
            );
          })}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
