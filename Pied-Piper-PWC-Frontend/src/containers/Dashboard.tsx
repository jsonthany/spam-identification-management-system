// import React, { useState, useRef } from "react";
import React, { useEffect, useState } from 'react';
// import { useNavigate } from "react-router-dom";
// import {
//   getMetrics,
//   getQuarantinedEmails,
//   getEmail,
//   getScannerSettings,
//   updateScannerSettings,
// } from "../services/dashboardService";
// import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import InputIcon from '@mui/icons-material/Input';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import DashCard from '../components/dashboard/DashCard';
// import LineGraph from '../components/dashboard/LineChart';
import BarBuckets from '../components/dashboard/BarBuckets';
import {
  getClassificationData,
  getQuarantineData,
  timeFrameInterface,
  // falsePositivesArray,
} from '../services/metricsService';
import { Counts, exampleCounts } from '../utilities/interfaces/Counts';
import PieBuckets from '../components/dashboard/PieBuckets';

const initializeData: timeFrameInterface = {
  oneDay: {
    SAFE: 0,
    SUSPECT: 0,
    QUARANTINE: 0,
  },
  oneWeek: {
    SAFE: 0,
    SUSPECT: 0,
    QUARANTINE: 0,
  },
  oneMonth: {
    SAFE: 0,
    SUSPECT: 0,
    QUARANTINE: 0,
  },
};

function Dashboard(): JSX.Element {
  const [pieCountMetrics, setPieCountMetrics] = useState<timeFrameInterface>(initializeData);
  const [barAvgMetrics, setBarAvgMetrics] = useState<timeFrameInterface>(initializeData);
  const [totalPending, setTotalPending] = useState<number>(0);
  // const [falsePositives, setFalsePositives] = useState<falsePositivesArray>();
  const [pieTimeFrame, setPieTimeFrame] = useState<number>(7);
  const [barTimeFrame, setBarTimeFrame] = useState<number>(7);
  // const [lineTimeFrame, setLineTimeFrame] = useState<number>(7);

  useEffect(() => {
    async function fetchClassificationData(): Promise<void> {
      const classificationData = await getClassificationData();
      setPieCountMetrics(classificationData.classificationCount);
      setBarAvgMetrics(classificationData.averageRiskScores);
    }
    async function fetchQuarantineData(): Promise<void> {
      const quarantineData = await getQuarantineData();
      setTotalPending(quarantineData.totalPending);
      // setFalsePositives(quarantineData.falsePositives);
    }
    fetchClassificationData();
    fetchQuarantineData();
  }, []);

  const handlePieClick = (event: React.MouseEvent): void => {
    event.preventDefault();

    const timeFrames = [1, 7, 30];
    // find current timeframe in array, get index
    const index = timeFrames.findIndex((value) => value === pieTimeFrame);
    // use index to get next
    const nextTimeFrame = index === timeFrames.length - 1 ? timeFrames[0] : timeFrames[index + 1];
    // setTimeFrame
    setPieTimeFrame(nextTimeFrame);
  };

  const handleBarClick = (event: React.MouseEvent): void => {
    event.preventDefault();

    const timeFrames = [1, 7, 30];
    // find current timeframe in array, get index
    const index = timeFrames.findIndex((value) => value === barTimeFrame);
    // use index to get next
    const nextTimeFrame = index === timeFrames.length - 1 ? timeFrames[0] : timeFrames[index + 1];
    // setTimeFrame
    setBarTimeFrame(nextTimeFrame);
  };

  // const handleLineClick = (event: React.MouseEvent): void => {
  //   event.preventDefault();

  //   const timeFrames = [7, 30, 365];
  //   // find current timeframe in array, get index
  //   const index = timeFrames.findIndex((value) => value === lineTimeFrame);
  //   // use index to get next
  //   const nextTimeFrame = index === timeFrames.length - 1 ? timeFrames[0] : timeFrames[index + 1]
  //   // setTimeFrame
  //   setLineTimeFrame(nextTimeFrame);
  // };

  type timeFrameString = keyof timeFrameInterface;

  const getPieBucketCounts = (timeFrame: number): Counts => {
    const data: Counts = exampleCounts;
    let timeFrameKey: timeFrameString = 'oneDay';
    if (timeFrame === 30) timeFrameKey = 'oneMonth';
    if (timeFrame === 7) timeFrameKey = 'oneWeek';
    data.safe = pieCountMetrics[timeFrameKey].SAFE;
    data.suspect = pieCountMetrics[timeFrameKey].SUSPECT;
    data.quarantine = pieCountMetrics[timeFrameKey].QUARANTINE;

    return data;
  };

  return (
    <div className="dashboard-container">
      <Grid container spacing={1} rowSpacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <DashCard title="Quarantined Emails to Review" link="/view">
            {totalPending}
          </DashCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <DashCard title="Input Data" link="/test">
            <InputIcon sx={{ fontSize: 100 }} />
          </DashCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <DashCard title="Algorithm Settings" link="/settings">
            <DisplaySettingsIcon sx={{ fontSize: 100 }} />
          </DashCard>
        </Grid>
        {/* <Grid item xs={12} sm={6} md={4}>
          <LineGraph
            metrics={falsePositives}
            timeFrame={lineTimeFrame}
            handleClick={handleLineClick}
          />
        </Grid> */}

        <Grid item xs={12} sm={6} md={4}>
          <BarBuckets
            metrics={barAvgMetrics}
            timeFrame={barTimeFrame}
            handleClick={handleBarClick}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <PieBuckets
            counts={getPieBucketCounts(pieTimeFrame)}
            timeFrame={pieTimeFrame}
            handleClick={handlePieClick}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;
