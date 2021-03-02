import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { pngJars } from "../../util/jars";
import { getJarChart, getStakingChart, getProtocolData } from "../../util/api";
import { materialBlack } from "../../util/constants";
import JarValueChart from "../../components/JarValueChart";
import Grid from "@material-ui/core/Grid";
import clsx from "clsx";
import { Page } from "@geist-ui/react";
import { TopBar } from "../../features/TopBar/TopBar";
import { Footer } from "../../features/Footer/Footer";

export const useStyles = makeStyles(() => ({
  title: {
    marginBottom: "10px",
    fontSize: "2rem",
    letterSpacing: "6px",
  },
  section: {
    color: materialBlack,
  },
  separator: {
    marginTop: "25px",
  },
}));

const chartSkeletons = (charts) =>
  Array.from({ length: charts.length }, (c, i) => ({
    asset: `${i}`,
    data: [],
  }));

export default function Dashboard() {
  const classes = useStyles();

  const [dashboardData, setDashboardData] = useState({
    pngJars: chartSkeletons(pngJars),
  });

  useEffect(() => {
    const retrieveDashboardData = async () => {
      const requests = [getJarChart(pngJars)];
      const dashboardData = await Promise.all(requests);

      // assign data objects from promise
      const pngData = dashboardData[0];
      const metrics = {
        date: protocolData.updatedAt,
        jarValue: protocolData.jarValue,
        totalValue: protocolData.totalValue,
      };

      // construct staking data
      setDashboardData({
        metrics: metrics,
        pngJars: pngData,
      });
    };
    retrieveDashboardData();
  }, []);

  return (
    <>
      <TopBar />
      <Page>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            className={clsx(classes.section, classes.separator)}
          >
            <h1>sBall 0</h1>
          </Grid>
          {dashboardData.pngJars.map((jar) => {
            return (
              <Grid item xs={12} sm={6} key={jar.asset}>
                <JarValueChart jar={jar} />
              </Grid>
            );
          })}
        </Grid>
        <Footer />
      </Page>
    </>
  );
}
