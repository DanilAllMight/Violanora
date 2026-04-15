import { useUserStore } from "../../../../entities/User/model/store/useUserStore";
import { PageLoader } from "../../../../shared/ui/PageLoader/PageLoader";
// Импорт из Shared
import { publicRoutes, privateRoutes } from "../config/routeConfig";
import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

export const AppRouter = () => {
  const isAuth = useUserStore((state) => state.authData);
  const userRole = useUserStore((state) => state.authData?.role) || "USER";
  const isAdmin = userRole == "ADMIN";
  console.log("PROVIDER ", isAdmin);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {publicRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {isAuth &&
          privateRoutes.map(({ path, element, roles }) => {
            // 1. Если у роута вообще нет ограничений по ролям, рендерим обычно
            if (!roles) {
              return <Route key={path} path={path} element={element} />;
            }

            // 2. Проверяем, есть ли роль пользователя в списке разрешенных ролей роута
            const hasAccess = roles.includes(userRole);

            return (
              <Route
                key={path}
                path={path}
                element={
                  hasAccess ? (
                    element
                  ) : (
                    <Navigate to="/" replace /> // Если доступа нет, редирект
                  )
                }
              />
            );
          })}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

/* {isAuth &&
          privateRoutes.map(({ path, element, roles }) => {
            console.log("PRIVATE ROUTE ", isAdmin);
            if (roles && isAdmin && !roles.includes(isAdmin)) {
              return (
                <Route
                  key={path}
                  path={path}
                  element={<Navigate to="/" replace />}
                />
              );
            }
            <Route key={path} path={path} element={element} />;
          })} */
