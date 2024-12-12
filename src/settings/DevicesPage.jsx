// import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import {
//   Table, TableRow, TableCell, TableHead, TableBody, Button, TableFooter, FormControlLabel, Switch, Box,
// } from '@mui/material';
// import LinkIcon from '@mui/icons-material/Link';
// import { useEffectAsync } from '../reactHelper';
// import { useTranslation } from '../common/components/LocalizationProvider';
// import PageLayout from '../common/components/PageLayout';
// import SettingsMenu from './components/SettingsMenu';
// import CollectionFab from './components/CollectionFab';
// import CollectionActions from './components/CollectionActions';
// import TableShimmer from '../common/components/TableShimmer';
// import SearchHeader, { filterByKeyword } from './components/SearchHeader';
// import { formatTime } from '../common/util/formatter';
// import { useDeviceReadonly, useManager } from '../common/util/permissions';
// import useSettingsStyles from './common/useSettingsStyles';
// import DeviceUsersValue from './components/DeviceUsersValue';

// const DevicesPage = () => {
//   const classes = useSettingsStyles();
//   const navigate = useNavigate();
//   const t = useTranslation();

//   const groups = useSelector((state) => state.groups.items);

//   const manager = useManager();
//   const deviceReadonly = useDeviceReadonly();

//   const [timestamp, setTimestamp] = useState(Date.now());
//   const [items, setItems] = useState([]);
//   const [searchKeyword, setSearchKeyword] = useState('');
//   const [showAll, setShowAll] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffectAsync(async () => {
//     setLoading(true);
//     try {
//       const query = new URLSearchParams({ all: showAll });
//       const response = await fetch(`/api/devices?${query.toString()}`);
//       if (response.ok) {
//         setItems(await response.json());
//       } else {
//         throw Error(await response.text());
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [timestamp, showAll]);

//   const handleExport = () => {
//     window.location.assign('/api/reports/devices/xlsx');
//   };

//   const actionConnections = {
//     key: 'connections',
//     title: t('sharedConnections'),
//     icon: <LinkIcon fontSize="small" />,
//     handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
//   };

//   return (
//     <Box sx={{
//       marginTop:'200px'
//     }}>
//     <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
//       <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
//       <Table className={classes.table}>
//         <TableHead>
//           <TableRow sx={{
//             backgroundColor:"#F4F6F8",
//           }}>
//             <TableCell sx={{fontSize:"15px"}}>{t('sharedName')}</TableCell>
//            <TableCell>{t('deviceIdentifier')}</TableCell>
//             <TableCell>{t('groupParent')}</TableCell>
//             <TableCell>{t('sharedPhone')}</TableCell>
//             <TableCell>{t('deviceModel')}</TableCell>
//             <TableCell>{t('deviceContact')}</TableCell>
//             <TableCell>{t('userExpirationTime')}</TableCell>
//             {manager && <TableCell>{t('settingsUsers')}</TableCell>}
//             <TableCell className={classes.columnAction} />
//           </TableRow>
//         </TableHead>
//         <TableBody sx={{backgroundColor:"#fff"}}>
//           {!loading ? items.filter(filterByKeyword(searchKeyword)).map((item) => (
//             <TableRow key={item.id}>
//               <TableCell>{item.name}</TableCell>
//               <TableCell>{item.uniqueId}</TableCell>
//               <TableCell>{item.groupId ? groups[item.groupId]?.name : null}</TableCell>
//               <TableCell>{item.phone}</TableCell>
//               <TableCell>{item.model}</TableCell>
//               <TableCell>{item.contact}</TableCell>
//               <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
//               {manager && <TableCell><DeviceUsersValue deviceId={item.id} /></TableCell>}
//               <TableCell className={classes.columnAction} padding="none">
//                 <CollectionActions
//                   itemId={item.id}
//                   editPath="/settings/device"
//                   endpoint="devices"
//                   setTimestamp={setTimestamp}
//                   customActions={[actionConnections]}
//                   readonly={deviceReadonly}
//                 />
//               </TableCell>
//             </TableRow>
//           )) : (<TableShimmer columns={manager ? 8 : 7} endAction />)}
//         </TableBody>
//         <TableFooter sx={{backgroundColor:"#fff"}}>
//           <TableRow>
//             <TableCell>
//               <Button onClick={handleExport} variant="text" sx={{
//                 color:"black",
//                 border:"1px solid lightblue",
//               }}>{t('reportExport')}</Button>
//             </TableCell>
//             <TableCell colSpan={manager ? 8 : 7} align="right">
//               <FormControlLabel
//                 control={(
//                   <Switch
//                     value={showAll}
//                     onChange={(e) => setShowAll(e.target.checked)}
//                     size="small"
//                   />
//                 )}
//                 label={t('notificationAlways')}
//                 labelPlacement="start"
//                 disabled={!manager}
//               />
//             </TableCell>
//           </TableRow>
//         </TableFooter>
//       </Table>
//       <CollectionFab editPath="/settings/device" />
//     </PageLayout>
//     </Box>
//   );
// };

// export default DevicesPage;

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Button,
  FormControlLabel,
  Switch,
  TableContainer,
  TablePagination,
  Paper,
  Checkbox,
  Box,
  TableSortLabel,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Menu,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import LinkIcon from "@mui/icons-material/Link";
import { visuallyHidden } from "@mui/utils";
import { useEffectAsync } from "../reactHelper";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import { formatTime } from "../common/util/formatter";
import { useDeviceReadonly, useManager } from "../common/util/permissions";
import useSettingsStyles from "./common/useSettingsStyles";
import DeviceUsersValue from "./components/DeviceUsersValue";
import { Add, Search } from "@mui/icons-material";
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
const DevicesPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const groups = useSelector((state) => state.groups.items);

  const manager = useManager();
  const deviceReadonly = useDeviceReadonly();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // const [menuState, setMenuState] = useState(false); 


  useEffectAsync(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ all: showAll });
      const response = await fetch(`/api/devices?${query.toString()}`);
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp, showAll]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = items.map((item) => item.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    window.location.assign("/api/reports/devices/xlsx");
  };

  const actionConnections = {
    key: "connections",
    title: t("sharedConnections"),
    icon: <LinkIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
  };

  const headCells = [
    { id: "name", label: t("sharedName"), numeric: false },
    { id: "uniqueId", label: t("deviceIdentifier"), numeric: false },
    { id: "groupParent", label: t("groupParent"), numeric: false },
    { id: "phone", label: t("sharedPhone"), numeric: false },
    { id: "model", label: t("deviceModel"), numeric: false },
    { id: "contact", label: t("deviceContact"), numeric: false },
    { id: "expirationTime", label: t("userExpirationTime"), numeric: false },
    ...(manager
      ? [{ id: "users", label: t("settingsUsers"), numeric: false }]
      : []),
    { id: "action", label: "Actions", numeric: false },
    
  ];

  const sortedItems = useMemo(
    () =>
      items
        .slice()
        .sort((a, b) =>
          order === "asc"
            ? a[orderBy]?.localeCompare?.(b[orderBy])
            : b[orderBy]?.localeCompare?.(a[orderBy])
        ),
    [items, order, orderBy]
  );

  const visibleItems = useMemo(
    () => sortedItems.filter(filterByKeyword(searchKeyword)),
    [sortedItems, searchKeyword]
  );

  const displayedItems = useMemo(
    () =>
      visibleItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [visibleItems, page, rowsPerPage]
  );
  const handleNavigate=()=>{
navigate('/settings/device')
  }

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);





  return (
    <Box sx={{ marginTop: "20px" }}>
      <PageLayout
        menu={<SettingsMenu />}
        breadcrumbs={["settingsTitle", "deviceTitle"]}
      >
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

        <Box m="30px 30px 0px 30px" display="flex" alignItems="center" mb={0}>
          <Typography variant="h5" sx={{ flex: 1 }} >
            {t("deviceTitle")}
          </Typography>
          <Button onClick={handleNavigate} variant="contained" startIcon={<Add />}  sx={{
    backgroundColor: "black", 
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.8)", 
    },
    color: "white", 
  }}>
            New Device
          </Button>
        </Box>

        <Paper
          sx={{
            m: "30px",
            borderRadius: "10px",
          }}
        >
          <Toolbar>
            {/* <Typography variant="h6" sx={{ flex: 1 }}>
              {t('deviceTitle')}
            </Typography> */}
            <Box
              sx={{
                flex: 1,
                mt:2,
                mb:2
              }}
            >
              <TextField 
                variant="outlined"
                placeholder="Search User ..."
                size="small"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <IconButton edge="start" size="small" sx={{ mr: 1 }}>
                      <Search  />
                    </IconButton>
                  ),
                }}
              />
            </Box>
            {selected.length > 0 ? (
              <Tooltip title={t("delete")}>
                <IconButton>
                  <DeleteIcon
                    sx={{
                      color: "red",
                    }}
                  />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title={t("filter")}>
                 <IconButton>
                  <FilterListIcon />
                </IconButton> 
              </Tooltip>
            )}
          </Toolbar>
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#F4F6F8",
                }}
              >
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 && selected.length < items.length
                      }
                      checked={
                        items.length > 0 && selected.length === items.length
                      }
                      onChange={handleSelectAllClick}
                      sx={{
                        '&.Mui-checked': {
                          color: '#1877F2',
                        },
                      }}
                    />
                  </TableCell>
                  {headCells.map((cell) => (
                    <TableCell key={cell.id}>
                      <TableSortLabel
                        active={orderBy === cell.id}
                        direction={orderBy === cell.id ? order : "asc"}
                        onClick={(e) => handleRequestSort(e, cell.id)}
                      >
                        {cell.label}
                        {orderBy === cell.id && (
                          <Box component="span" sx={visuallyHidden}>
                            {order === "desc"
                              ? "sorted descending"
                              : "sorted ascending"}
                          </Box>
                        )}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading ? (
                  displayedItems.map((item) => {
                    const isSelected = selected.includes(item.id);
                    return (
                      <TableRow
                        key={item.id}
                        onClick={(e) => handleClick(e, item.id)}
                        selected={isSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isSelected}
                           sx={{
        '&.Mui-checked': {
          color: selected ? '#1877F2' : 'default',  
        },
      }}
      />
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.uniqueId}</TableCell>
                        <TableCell>
                          {groups[item.groupId]?.name || ""}
                        </TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>{item.model}</TableCell>
                        <TableCell>{item.contact}</TableCell>
                        <TableCell>
                          {formatTime(item.expirationTime, "date")}
                        </TableCell>
                        {manager && (
                          <TableCell>
                            <DeviceUsersValue deviceId={item.id} />
                          </TableCell>
                        )}
                        <TableCell>





                        
      {/* <Paper>
        <MenuList>
          <MenuItem>Profile</MenuItem>
          <MenuItem>My account</MenuItem>
          <MenuItem>Logout</MenuItem>
        </MenuList>
      </Paper> */}
    
        <Button
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? 'composition-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <MoreVertIcon/>
          
        </Button>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-start"
          transition
          disablePortal

          sx={{zIndex:"1"}}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom-start' ? 'left top' : 'left bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem onClick={handleClose}>
                      <CollectionActions
                            itemId={item.id}
                            editPath="/settings/device"
                            endpoint="devices"
                            setTimestamp={setTimestamp}
                            customActions={[actionConnections]}
                            readonly={deviceReadonly}
                          />


                    </MenuItem>
                    {/* <MenuItem onClick={handleClose}>My account</MenuItem>
                    <MenuItem onClick={handleClose}>Logout</MenuItem> */}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      













                          
                        {/* <Menu
              id="action-menu"
              anchorEl={menuState.anchorEl}
              open={menuState.id === item.id}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => navigate(`/settings/device/${item.id}/edit`)}>
                <EditIcon sx={{ marginRight: "8px" }} /> Edit
              </MenuItem>
              <MenuItem onClick={() => handleDelete(item.id)}>
                <DeleteIcon sx={{ marginRight: "8px", color: "red" }} /> Delete
              </MenuItem>
              <MenuItem onClick={() => navigate(`/settings/device/${item.id}/connections`)}>
                <LinkIcon sx={{ marginRight: "8px" }} /> Connections
              </MenuItem>
            </Menu> */}
            
                          
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableShimmer columns={headCells.length + 1} />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={visibleItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        <Box
          sx={{
            m: "20px 30px 30px 30px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Button variant="outlined" onClick={handleExport}>
              {t("reportExport")}
            </Button>
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  value={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  size="small"
                />
              }
              label={t("notificationAlways")}
              labelPlacement="start"
              disabled={!manager}
            />
          </Box>
        </Box>
        {/* <CollectionFab editPath="/settings/device" /> */}
      </PageLayout>
    </Box>
  );
};

export default DevicesPage;