import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const COLLECTION = 'userRoles';

export const ADMIN_ROLE_STATUS = Object.freeze({
  idle: 'idle',
  guest: 'guest',
  loading: 'loading',
  ready: 'ready',
  error: 'error'
});

export const useAdminRole = () => {
  const { user } = useAuth();
  const [state, setState] = useState({
    status: ADMIN_ROLE_STATUS.idle,
    isAdmin: false,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setState({ status: ADMIN_ROLE_STATUS.guest, isAdmin: false, error: null });
      return undefined;
    }

    setState((prev) => ({ ...prev, status: ADMIN_ROLE_STATUS.loading, error: null }));

    const userRoleRef = doc(db, COLLECTION, user.uid);

    const unsubscribe = onSnapshot(
      userRoleRef,
      (snapshot) => {
        const role = snapshot.exists() ? snapshot.data()?.role : null;
        setState({
          status: ADMIN_ROLE_STATUS.ready,
          isAdmin: role === 'admin',
          error: null
        });
      },
      (error) => {
        console.error('No pudimos recuperar el rol del usuario', error);
        setState({ status: ADMIN_ROLE_STATUS.error, isAdmin: false, error });
      }
    );

    return unsubscribe;
  }, [user]);

  return useMemo(
    () => ({
      status: state.status,
      isAdmin: state.isAdmin,
      error: state.error
    }),
    [state.error, state.isAdmin, state.status]
  );
};
