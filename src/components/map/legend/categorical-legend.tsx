import { Rectangle } from "mdi-material-ui";
import { Grid, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import * as _ from "lodash";
import { useEffect, useRef, useState } from "react";

import { ColorMapping } from "@/components/interface/sidebars/formatting/color-mapping";
import { useCatalogData } from "@/components/data/use-data";
import { DataSource, DataSourceDataDescription } from "../../custom/types";

interface LegendElementProps {
  dataSource: DataSource;
  layerType: "twoD" | "threeD" | "plot";
}

export default function CategoricalLegend({
  dataSource,
  layerType,
}: LegendElementProps) {
  const t = useTranslations("Common");

  const parentRef = useRef<HTMLInputElement>(null);

  console.log(dataSource.formatting[layerType].color.categorical.variable);

  const { data: allData } = useCatalogData();

  const data = allData.byID[dataSource.internal_id];

  const [categories, setCategories] = useState<
    {
      value: string | number;
      frequency: number;
      color: string;
    }[]
  >([]);

  const [variableDataDescription, setVariableDataDescription] =
    useState<DataSourceDataDescription>({} as DataSourceDataDescription);

  const frequency = (arr: (string | number)[], item: string | number) => {
    return arr.filter((x) => x === item).length;
  };

  useEffect(() => {
    if (data) {
      const varDataDescription =
        dataSource.metadata.variables.by_id[
          dataSource.formatting[layerType].color.categorical.variable
        ];

      if (varDataDescription) {
        const colorCalc = (value: string | number) => {
          const color = ColorMapping(
            data.data.find((el) => el[varDataDescription.variable] == value)!,
            dataSource.formatting[layerType].color,
          );
          return `rgb(${color![0]},${color![1]},${color![2]})`;
        };

        const unique_data_elements = data.data
          .map(
            (el) =>
              el[dataSource.formatting[layerType].color.categorical.variable],
          )
          .filter((value, index, array) => array.indexOf(value) === index);

        const frequencies = unique_data_elements.map((element) =>
          frequency(
            data.data.map(
              (el) =>
                el[dataSource.formatting[layerType].color.categorical.variable],
            ),
            element,
          ),
        );

        const categories = [];

        let i = 0;
        for (const value of unique_data_elements) {
          categories.push({
            value: value,
            frequency: frequencies[i],
            color: data.data && colorCalc(value),
          });
          i++;
        }

        const sorted_categories = _.orderBy(
          categories,
          ["frequency", "value"],
          ["desc", "asc"],
        );

        // const nums = unique_data_elements
        //   .filter((n) => typeof n == "number")
        //   .sort((a, b) => a - b); // If the data type of a given element is a number store it in this array (and then sort numerically)
        // const non_nums = unique_data_elements
        //   .filter((x) => typeof x != "number")
        //   .sort(); // Store everything that is not a number in an array (and then sort lexicographically)

        // const sorted_unique_data_elements = [...nums, ...non_nums]; // combine the two arrays

        // console.log(frequencies);
        // console.log(sorted_unique_data_elements);

        setCategories(sorted_categories);
        setVariableDataDescription(varDataDescription);
      }
    }
  }, [data, dataSource.formatting, dataSource.metadata.variables.by_id, layerType]);

  return (
    <div ref={parentRef}>
      <Stack
        id={`ColormapLegend-${dataSource.internal_id}`}
        sx={{
          width: "200px",
          maxHeight: "150px",
          overflowY: "scroll",
          scrollbarWidth: "none",
          transition: "max-height .2s",
          scrollbarGutter: "stable",
          ":hover": {
            scrollbarWidth: "auto",
            maxHeight: "calc(100vh - 64px - 30px - 32px - 32px - 26px)",
          },
          ":hover .headrow": {
            maxHeight: "auto",
          },
        }}
      >
        <Grid className="headrow" container direction="row">
          <Grid size={2}></Grid>
          <Grid size="grow">
            <Typography
              sx={{
                textOverflow: "ellipses",
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              {variableDataDescription.alias
                ? variableDataDescription.alias
                : variableDataDescription.variable}
            </Typography>
          </Grid>
          <Grid size="auto" sx={{ fontWeight: "bold", fontSize: 12 }}>
            <Typography>#</Typography>
          </Grid>
        </Grid>
        {categories &&
          categories.slice(0, 64).map((category) => (
            <Grid
              container
              key={"Index-" + category.value}
              alignItems="center"
              direction="row"
            >
              <Grid size={2}>
                <Rectangle sx={{ color: category.color }} />
              </Grid>
              <Grid size="grow" alignItems="end">
                <Typography>{category.value}</Typography>
              </Grid>
              <Grid size="auto">
                <Typography>{category.frequency}</Typography>
              </Grid>
            </Grid>
          ))}
        <Grid container direction="row" alignItems="center" sx={{ mt: 1 }}>
          <Grid size={2}></Grid>
          <Grid
            display={"flex"}
            size="grow"
            sx={{ justifyContent: "flex-end", mr: 1 }}
          >
            <Typography sx={{ fontSize: 12 }}>
              {t("legend_remaining")}:
            </Typography>
          </Grid>
          <Grid size="auto">
            <Typography sx={{ fontSize: 12 }}>
              {categories.slice(64).length}
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </div>
  );
}
