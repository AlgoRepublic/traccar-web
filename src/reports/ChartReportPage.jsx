import dayjs from "dayjs";
import React, { useState } from "react";
import {
  FormControl, InputLabel, Select, MenuItem, useTheme,Box,
} from '@mui/material';
import {
  altitudeFromMeters,
  distanceFromMeters,
  speedFromKnots,
  volumeFromLiters,
} from "../common/util/converter";
import useReportStyles from "./common/useReportStyles";
import { useTranslation } from "../common/components/LocalizationProvider";
import usePositionAttributes from "../common/attributes/usePositionAttributes";
import { useAttributePreference } from "../common/util/preferences";
import { useCatch, useCatchCallback } from "../reactHelper";
import PageLayout from "../common/components/PageLayout";
import ReportFilter from "./components/ReportFilter";
import ReportsMenu from "./components/ReportsMenu";

const ChartReportPage = () => {
  const classes = useReportStyles();
  const theme = useTheme();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const distanceUnit = useAttributePreference("distanceUnit");
  const altitudeUnit = useAttributePreference("altitudeUnit");
  const speedUnit = useAttributePreference("speedUnit");
  const volumeUnit = useAttributePreference("volumeUnit");

  const [items, setItems] = useState([]);
  const [types, setTypes] = useState(["speed"]);
  const [type, setType] = useState("speed");
  const [timeType, setTimeType] = useState("fixTime");

  const values = items.map((it) => it[type]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/reports/route?${query.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      const positions = await response.json();
      const keySet = new Set();
      const keyList = [];
      const formattedPositions = positions.map((position) => {
        const data = { ...position, ...position.attributes };
        const formatted = {};
        formatted.fixTime = dayjs(position.fixTime).valueOf();
        formatted.deviceTime = dayjs(position.deviceTime).valueOf();
        formatted.serverTime = dayjs(position.serverTime).valueOf();
        Object.keys(data)
          .filter((key) => !["id", "deviceId"].includes(key))
          .forEach((key) => {
            const value = data[key];
            if (typeof value === "number") {
              keySet.add(key);
              const definition = positionAttributes[key] || {};
              switch (definition.dataType) {
                case "speed":
                  formatted[key] = speedFromKnots(value, speedUnit).toFixed(2);
                  break;
                case "altitude":
                  formatted[key] = altitudeFromMeters(
                    value,
                    altitudeUnit
                  ).toFixed(2);
                  break;
                case "distance":
                  formatted[key] = distanceFromMeters(
                    value,
                    distanceUnit
                  ).toFixed(2);
                  break;
                case "volume":
                  formatted[key] = volumeFromLiters(value, volumeUnit).toFixed(
                    2
                  );
                  break;
                case "hours":
                  formatted[key] = (value / 1000).toFixed(2);
                  break;
                default:
                  formatted[key] = value;
                  break;
              }
            }
          });
        return formatted;
      });
      Object.keys(positionAttributes).forEach((key) => {
        if (keySet.has(key)) {
          keyList.push(key);
          keySet.delete(key);
        }
      });
      setTypes([...keyList, ...keySet]);
      setItems(formattedPositions);
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <Box sx={{marginTop:"50px"}}>
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "reportChart"]}
    >
       <div className={classes.container} style={{backgroundColor:"#fff", borderRadius:"10px",
          margin: "10px 20px", boxShadow:"0 0 12px 0 rgba(0, 0, 0, 20%)"}}>
       <ReportFilter  handleSubmit={handleSubmit} showOnly>
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t("reportChartType")}</InputLabel>
            <Select
              sx={{ backgroundColor: "#303234", borderRadius: "100px" }}
              label={t("reportChartType")}
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={!items.length}
            >
              {types.map((key) => (
                <MenuItem key={key} value={key}>
                  {positionAttributes[key]?.name || key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t("reportTimeType")}</InputLabel>
            <Select
              sx={{ backgroundColor: "#303234", borderRadius: "100px" }}
              label={t("reportTimeType")}
              value={timeType}
              onChange={(e) => setTimeType(e.target.value)}
              disabled={!items.length}
            >
              <MenuItem value="fixTime">{t("positionFixTime")}</MenuItem>
              <MenuItem value="deviceTime">{t("positionDeviceTime")}</MenuItem>
              <MenuItem value="serverTime">{t("positionServerTime")}</MenuItem>
            </Select>
          </FormControl>
        </div>
      </ReportFilter>
      {items.length > 0 && (
        <div className={classes.chart}>
          <ResponsiveContainer>
            <LineChart
              data={items}
              margin={{
                top: 10,
                right: 40,
                left: 0,
                bottom: 10,
              }}
            >
              <XAxis
                stroke={theme.palette.text.primary}
                dataKey={timeType}
                type="number"
                tickFormatter={(value) => formatTime(value, "time")}
                domain={["dataMin", "dataMax"]}
                scale="time"
              />
              <YAxis
                stroke={theme.palette.text.primary}
                type="number"
                tickFormatter={(value) => value.toFixed(2)}
                domain={[minValue - valueRange / 5, maxValue + valueRange / 5]}
              />
              <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
              <Tooltip
                formatter={(value, key) => [
                  value,
                  positionAttributes[key]?.name || key,
                ]}
                labelFormatter={(value) => formatTime(value, "seconds")}
              />
              <Line type="monotone" dataKey={type} stroke={theme.palette.primary.main} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
       </div>
      
    </PageLayout>
    </Box>
  );
};

export default ChartReportPage;
