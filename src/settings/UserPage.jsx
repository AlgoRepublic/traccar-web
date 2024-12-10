import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
  OutlinedInput,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CachedIcon from '@mui/icons-material/Cached';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import useUserAttributes from '../common/attributes/useUserAttributes';
import { sessionActions } from '../store';
import SelectField from '../common/components/SelectField';
import SettingsMenu from './components/SettingsMenu';
import useCommonUserAttributes from '../common/attributes/useCommonUserAttributes';
import { useAdministrator, useRestriction, useManager } from '../common/util/permissions';
import useQuery from '../common/util/useQuery';
import { useCatch } from '../reactHelper';
import useMapStyles from '../map/core/useMapStyles';
import { map } from '../map/core/MapView';
import useSettingsStyles from './common/useSettingsStyles';

const UserPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const manager = useManager();
  const fixedEmail = useRestriction('fixedEmail');

  const currentUser = useSelector((state) => state.session.user);
  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const openIdForced = useSelector((state) => state.session.server.openIdForce);
  const totpEnable = useSelector((state) => state.session.server.attributes.totpEnable);
  const totpForce = useSelector((state) => state.session.server.attributes.totpForce);

  const mapStyles = useMapStyles();
  const commonUserAttributes = useCommonUserAttributes(t);
  const userAttributes = useUserAttributes(t);

  const { id } = useParams();
  const [item, setItem] = useState(id === currentUser.id.toString() ? currentUser : null);

  const [deleteEmail, setDeleteEmail] = useState();
  const [deleteFailed, setDeleteFailed] = useState(false);

  const handleDelete = useCatch(async () => {
    if (deleteEmail === currentUser.email) {
      setDeleteFailed(false);
      const response = await fetch(`http://localhost:8082/api/users/${currentUser.id}`, { method: 'DELETE' });
      if (response.ok) {
        navigate('/login');
        dispatch(sessionActions.updateUser(null));
      } else {
        throw Error(await response.text());
      }
    } else {
      setDeleteFailed(true);
    }
  });

  const handleGenerateTotp = useCatch(async () => {
    const response = await fetch('http://localhost:8082/api/users/totp', { method: 'POST' });
    if (response.ok) {
      setItem({ ...item, totpKey: await response.text() });
    } else {
      throw Error(await response.text());
    }
  });

  const query = useQuery();
  const [queryHandled, setQueryHandled] = useState(false);
  const attribute = query.get('attribute');

  useEffect(() => {
    if (!queryHandled && item && attribute) {
      if (!item.attributes.hasOwnProperty('attribute')) {
        const updatedAttributes = { ...item.attributes };
        updatedAttributes[attribute] = '';
        setItem({ ...item, attributes: updatedAttributes });
      }
      setQueryHandled(true);
    }
  }, [item, queryHandled, setQueryHandled, attribute]);

  const onItemSaved = (result) => {
    if (result.id === currentUser.id) {
      dispatch(sessionActions.updateUser(result));
    }
  };

  const validate = () => item && item.name && item.email && (item.id || item.password) && (admin || !totpForce || item.totpKey);

  return (
    <Box sx={{marginTop:"50px"}}>
    <EditItemView
      endpoint="users"
      item={item}
      setItem={setItem}
      defaultItem={admin ? { deviceLimit: -1 } : {}}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsUser']}
    >
      {item && (
        <>
          <Accordion defaultExpanded={!attribute}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ''}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                label={t('sharedName')}
                sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
              />
              <TextField
                value={item.email || ''}
                onChange={(e) => setItem({ ...item, email: e.target.value })}
                label={t('userEmail')}
                disabled={fixedEmail && item.id === currentUser.id}

                sx={{
                  backgroundColor: "white",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white', 
                },
              
              }}
                
              />
              {!openIdForced && (
                <TextField
                  type="password"
                  onChange={(e) => setItem({ ...item, password: e.target.value })}
                  label={t('userPassword')}

                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                />
              )}
              {totpEnable && (
                <FormControl>
                  <InputLabel>{t('loginTotpKey')}</InputLabel>
                  <OutlinedInput
                    readOnly
                    label={t('loginTotpKey')}
                    value={item.totpKey || ''}
                    endAdornment={(
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end" onClick={handleGenerateTotp}>
                          <CachedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" edge="end" onClick={() => setItem({ ...item, totpKey: null })}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )}
                  />
                </FormControl>
              )}
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedPreferences')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.phone || ''}
                onChange={(e) => setItem({ ...item, phone: e.target.value })}
                label={t('sharedPhone')}

                sx={{
                  backgroundColor: "white",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white', 
                },
              
              }}


              />
              <FormControl>
                <InputLabel>{t('mapDefault')}</InputLabel>
                <Select
                  label={t('mapDefault')}
                  value={item.map || 'openFreeMap'}
                  onChange={(e) => setItem({ ...item, map: e.target.value })}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                >
                  {mapStyles.filter((style) => style.available).map((style) => (
                    <MenuItem key={style.id} value={style.id}>
                      <Typography component="span">{style.title}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>{t('settingsCoordinateFormat')}</InputLabel>
                <Select
                  label={t('settingsCoordinateFormat')}
                  value={item.coordinateFormat || 'dd'}
                  onChange={(e) => setItem({ ...item, coordinateFormat: e.target.value })}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                >
                  <MenuItem value="dd">{t('sharedDecimalDegrees')}</MenuItem>
                  <MenuItem value="ddm">{t('sharedDegreesDecimalMinutes')}</MenuItem>
                  <MenuItem value="dms">{t('sharedDegreesMinutesSeconds')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>{t('settingsSpeedUnit')}</InputLabel>
                <Select
                  label={t('settingsSpeedUnit')}
                  value={(item.attributes && item.attributes.speedUnit) || 'kn'}
                  onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, speedUnit: e.target.value } })}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                >
                  <MenuItem value="kn">{t('sharedKn')}</MenuItem>
                  <MenuItem value="kmh">{t('sharedKmh')}</MenuItem>
                  <MenuItem value="mph">{t('sharedMph')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>{t('settingsDistanceUnit')}</InputLabel>
                <Select
                  label={t('settingsDistanceUnit')}
                  value={(item.attributes && item.attributes.distanceUnit) || 'km'}
                  onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, distanceUnit: e.target.value } })}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                >
                  <MenuItem value="km">{t('sharedKm')}</MenuItem>
                  <MenuItem value="mi">{t('sharedMi')}</MenuItem>
                  <MenuItem value="nmi">{t('sharedNmi')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>{t('settingsAltitudeUnit')}</InputLabel>
                <Select
                  label={t('settingsAltitudeUnit')}
                  value={(item.attributes && item.attributes.altitudeUnit) || 'm'}
                  onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, altitudeUnit: e.target.value } })}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
               >
                  <MenuItem value="m">{t('sharedMeters')}</MenuItem>
                  <MenuItem value="ft">{t('sharedFeet')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>{t('settingsVolumeUnit')}</InputLabel>
                <Select
                  label={t('settingsVolumeUnit')}
                  value={(item.attributes && item.attributes.volumeUnit) || 'ltr'}
                  onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, volumeUnit: e.target.value } })}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
               >
                  <MenuItem value="ltr">{t('sharedLiter')}</MenuItem>
                  <MenuItem value="usGal">{t('sharedUsGallon')}</MenuItem>
                  <MenuItem value="impGal">{t('sharedImpGallon')}</MenuItem>
                </Select>
              </FormControl>
              <SelectField
              style={{backgroundColor:"green !important"}}
                value={item.attributes && item.attributes.timezone}
                onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, timezone: e.target.value } })}
                endpoint="/api/server/timezones"
                keyGetter={(it) => it}
                titleGetter={(it) => it}
                label={t('sharedTimezone')}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff !important",

                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "red !important", // Adjust border color if needed
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.87)", // Hover effect
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#3f51b5 !important", // Focused border color
                  },
                }}
              />
              <TextField
                value={item.poiLayer || ''}
                onChange={(e) => setItem({ ...item, poiLayer: e.target.value })}
                label={t('mapPoiLayer')}
                sx={{
                  backgroundColor: "white",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white', 
                },
              
              }}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedLocation')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                type="number"
                value={item.latitude || 0}
                onChange={(e) => setItem({ ...item, latitude: Number(e.target.value) })}
                label={t('positionLatitude')}
                sx={{
                  backgroundColor: "white",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white', 
                },
              
              }}
              />
              <TextField
                type="number"
                value={item.longitude || 0}
                onChange={(e) => setItem({ ...item, longitude: Number(e.target.value) })}
                label={t('positionLongitude')}
                sx={{
                  backgroundColor: "white",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white', 
                },
              
              }}
              />
              <TextField
                type="number"
                value={item.zoom || 0}
                onChange={(e) => setItem({ ...item, zoom: Number(e.target.value) })}
                label={t('serverZoom')}
                sx={{
                  backgroundColor: "white",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white', 
                },
              
              }}
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  const { lng, lat } = map.getCenter();
                  setItem({
                    ...item,
                    latitude: Number(lat.toFixed(6)),
                    longitude: Number(lng.toFixed(6)),
                    zoom: Number(map.getZoom().toFixed(1)),
                  });
                }}
              >
                {t('mapCurrentLocation')}
              </Button>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedPermissions')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                label={t('userExpirationTime')}
                type="date"
                value={item.expirationTime ? item.expirationTime.split('T')[0] : '2099-01-01'}
                onChange={(e) => {
                  if (e.target.value) {
                    setItem({ ...item, expirationTime: new Date(e.target.value).toISOString() });
                  }
                }}
                sx={{
                  backgroundColor: "white",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white', 
                },
              
              }}
                disabled={!manager}
              />
              <TextField
                type="number"
                value={item.deviceLimit || 0}
                onChange={(e) => setItem({ ...item, deviceLimit: Number(e.target.value) })}
                label={t('userDeviceLimit')}
                disabled={!admin}
                sx={{
                  backgroundColor: "white",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white', 
                },
              
              }}
              />
              <TextField
                type="number"
                value={item.userLimit || 0}
                onChange={(e) => setItem({ ...item, userLimit: Number(e.target.value) })}
                label={t('userUserLimit')}
                disabled={!admin}
                sx={{
                  backgroundColor: "white",
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white', 
                },
              
              }}
              />
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={item.disabled} onChange={(e) => setItem({ ...item, disabled: e.target.checked })} />}
                  label={t('sharedDisabled')}
                  disabled={!manager}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                />
                <FormControlLabel
                  control={<Checkbox checked={item.administrator} onChange={(e) => setItem({ ...item, administrator: e.target.checked })} />}
                  label={t('userAdmin')}
                  disabled={!admin}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                />
                <FormControlLabel
                  control={<Checkbox checked={item.readonly} onChange={(e) => setItem({ ...item, readonly: e.target.checked })} />}
                  label={t('serverReadonly')}
                  disabled={!manager}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                />
                <FormControlLabel
                  control={<Checkbox checked={item.deviceReadonly} onChange={(e) => setItem({ ...item, deviceReadonly: e.target.checked })} />}
                  label={t('userDeviceReadonly')}
                  disabled={!manager}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                />
                <FormControlLabel
                  control={<Checkbox checked={item.limitCommands} onChange={(e) => setItem({ ...item, limitCommands: e.target.checked })} />}
                  label={t('userLimitCommands')}
                  disabled={!manager}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                />
                <FormControlLabel
                  control={<Checkbox checked={item.disableReports} onChange={(e) => setItem({ ...item, disableReports: e.target.checked })} />}
                  label={t('userDisableReports')}
                  disabled={!manager}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                />
                <FormControlLabel
                  control={<Checkbox checked={item.fixedEmail} onChange={(e) => setItem({ ...item, fixedEmail: e.target.checked })} />}
                  label={t('userFixedEmail')}
                  disabled={!manager}
                  sx={{
                    backgroundColor: "white",

                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <EditAttributesAccordion
            attribute={attribute}
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonUserAttributes, ...userAttributes }}
            focusAttribute={attribute}
          />
          {registrationEnabled && item.id === currentUser.id && !manager && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" color="error">
                  {t('userDeleteAccount')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  label={t('userEmail')}
                  sx={{
                    backgroundColor: "white",
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white', 
                  },
                
                }}
                  error={deleteFailed}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  startIcon={<DeleteForeverIcon />}
                >
                  {t('userDeleteAccount')}
                </Button>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}
    </EditItemView>
    </Box>
  );
};

export default UserPage;
