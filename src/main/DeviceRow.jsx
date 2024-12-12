import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import {
  IconButton, Tooltip, Avatar, ListItemAvatar, ListItemText, ListItemButton,Box, Divider,
} from '@mui/material';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import ErrorIcon from '@mui/icons-material/Error';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm, formatBoolean, formatPercentage, formatStatus, getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg?react';
import { useAttributePreference } from '../common/util/preferences';

dayjs.extend(relativeTime);

const useStyles = makeStyles((theme) => ({
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  batteryText: {
    fontSize: '0.75rem',
    fontWeight: 'normal',
    lineHeight: '0.875rem',
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  // error: {
  //   color: theme.palette.error.main,
  // },
  neutral: {
    color: theme.palette.neutral.main,
  },
  container: {
        padding: theme.spacing(1),
        marginBottom: theme.spacing(1),
      },
}));

const DeviceRow = ({ data, index, style, link,  selected = false  }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();

  const item = data[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');



  const secondaryText = () => {
    let status;
    if (item.status === 'online' || !item.lastUpdate) {
      status = formatStatus(item.status, t);
    } else {
      status = dayjs(item.lastUpdate).fromNow();
    }
    return (
      <>
        {deviceSecondary && item[deviceSecondary] && `${item[deviceSecondary]} • `}
        <span className={classes[getStatusColor(item.status)]}>{status}</span>
      </>
    );
  };

  return (
    // <div style={style}>
    <Box style={style} className={classes.container}>
      <ListItemButton disableGutters key={link}  component={Link} to={link}
        sx={{
          pl: 2,
          // py: 1.5,
          gap: 2,
          pr: 1.5,
          // m:1.3,
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          lineHeight: 1.5,
          color: '#637381',
          bgcolor: "#fff",
          '&:hover': { bgcolor: '#F6F7F9', color: '#637381', },
          ...(selected && {
            fontWeight: 'bold',
            bgcolor: '#1877F214',
            color: '#71a0de',
            '&:hover': {
              bgcolor: '#cbdff7',
            },
          }),
        }}
        // key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
      >
  
        <ListItemAvatar>
          <Avatar>
            <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={item[devicePrimary]}
          primaryTypographyProps={{ noWrap: true }}
          secondary={secondaryText()}
          secondaryTypographyProps={{ noWrap: true }}
        />
        {position && (
          <>
            {position.attributes.hasOwnProperty('alarm') && (
              <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                <IconButton size="small">
                  <ErrorIcon fontSize="small" className={classes.error} />
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('ignition') && (
              <Tooltip title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}>
                <IconButton size="small">
                  {position.attributes.ignition ? (
                    <EngineIcon width={20} height={20} className={classes.success} />
                  ) : (
                    <EngineIcon width={20} height={20} className={classes.neutral} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('batteryLevel') && (
              <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}>
                <IconButton size="small">
                  {(position.attributes.batteryLevel > 70 && (
                    position.attributes.charge
                      ? (<BatteryChargingFullIcon fontSize="small" className={classes.success} />)
                      : (<BatteryFullIcon fontSize="small" className={classes.success} />)
                  )) || (position.attributes.batteryLevel > 30 && (
                    position.attributes.charge
                      ? (<BatteryCharging60Icon fontSize="small" className={classes.warning} />)
                      : (<Battery60Icon fontSize="small" className={classes.warning} />)
                  )) || (
                    position.attributes.charge
                      ? (<BatteryCharging20Icon fontSize="small" className={classes.error} />)
                      : (<Battery20Icon fontSize="small" className={classes.error} />)
                  )}
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </ListItemButton>
      {/* <Divider /> */}
      </Box>
    // </div>
  );
};

export default DeviceRow;