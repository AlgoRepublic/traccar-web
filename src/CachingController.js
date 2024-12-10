import { useDispatch, useSelector, connect } from 'react-redux';

import {
  geofencesActions, groupsActions, driversActions, maintenancesActions, calendarsActions,
} from './store';
import { useEffectAsync } from './reactHelper';

const CachingController = () => {
  const authenticated = useSelector((state) => !!state.session.user);
  const dispatch = useDispatch();

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch('http://localhost:8082/api/geofences');
      if (response.ok) {
        dispatch(geofencesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch('http://localhost:8082/api/groups');
      if (response.ok) {
        dispatch(groupsActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch('http://localhost:8082/api/drivers');
      if (response.ok) {
        dispatch(driversActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch('http://localhost:8082/api/maintenance');
      if (response.ok) {
        dispatch(maintenancesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated) {
      const response = await fetch('http://localhost:8082/api/calendars');
      if (response.ok) {
        dispatch(calendarsActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
  }, [authenticated]);

  return null;
};

export default connect()(CachingController);
