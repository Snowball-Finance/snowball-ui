import { FC } from "react";
import { Grid, Page } from "@geist-ui/react";
import { TopBar } from "../features/TopBar/TopBar";
import { Balances } from "../features/Balances/Balances";
import { Prices } from "../features/Prices/Prices";
// import { SummaryCard as Farms } from "../features/Farms/SummaryCard";
import { SummaryCard as Jars } from "../features/Jars/SummaryCard";
import { Footer } from "../features/Footer/Footer";

const Home: FC = () => {
  return (
    <>
      <TopBar />
      <Page>
        <Page.Content>
          <h1 style={{ fontSize: `2rem`, fontFamily: `Source Code Pro` }}>
            The Future of Finance is Green
          </h1>
          <Grid.Container gap={2}>
            {/* <Grid xs={24} sm={24} md={16}>
              <Balances />
            </Grid> */}
            <Grid xs={24} sm={24} md={12}>
              <Jars />
            </Grid>
          </Grid.Container>
        </Page.Content>
        <Footer />
      </Page>
    </>
  );
};

export default Home;
