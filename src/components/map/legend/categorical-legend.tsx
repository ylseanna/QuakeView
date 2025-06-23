import { useEffect, useRef, useState } from "react";
import { DataSource, DataSourceDataDescription } from "../../datasource/types";
import { useDataStore } from "@/providers/data-store-provider";
import { Grid2, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { Rectangle } from "mdi-material-ui";
import { ColorMapping } from "@/components/datasource/formatting/color-mapping";
import * as _ from "lodash";

interface LegendElementProps {
  dataSource: DataSource;
}

export default function CategoricalLegend({ dataSource }: LegendElementProps) {
  const t = useTranslations("Common");

  const parentRef = useRef<HTMLInputElement>(null);

  console.log(dataSource.formatting.color.categorical.variable);

  const data = useDataStore((state) => state.data[dataSource.internal_id]);

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
      const varDataDescription = dataSource.metadata.data_descr.find(
        (el) => el.variable == dataSource.formatting.color.categorical.variable
      )!;

      if (varDataDescription) {
        const colorCalc = (value: string | number) => {
          const color = ColorMapping(
            data.data.find((el) => el[varDataDescription.variable] == value)!,
            dataSource.formatting.color
          );
          return `rgb(${color![0]},${color![1]},${color![2]})`;
        };

        const unique_data_elements = data.data
          .map((el) => el[dataSource.formatting.color.categorical.variable])
          .filter((value, index, array) => array.indexOf(value) === index);

        const frequencies = unique_data_elements.map((element) =>
          frequency(
            data.data.map(
              (el) => el[dataSource.formatting.color.categorical.variable]
            ),
            element
          )
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
          ["desc", "asc"]
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
  }, [
    data,
    dataSource.formatting.color,
    dataSource.formatting.color.categorical.variable,
    dataSource.metadata.data_descr,
  ]);

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
        <Grid2 className="headrow" container direction="row">
          <Grid2 size={2}></Grid2>
          <Grid2 size="grow">
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
          </Grid2>
          <Grid2 size="auto" sx={{ fontWeight: "bold", fontSize: 12 }}>
            <Typography>#</Typography>
          </Grid2>
        </Grid2>
        {categories &&
          categories.slice(0, 64).map((category) => (
            <Grid2
              container
              key={"Index-" + category.value}
              alignItems="center"
              direction="row"
            >
              <Grid2 size={2}>
                <Rectangle sx={{ color: category.color }} />
              </Grid2>
              <Grid2 size="grow" alignItems="end">
                <Typography>{category.value}</Typography>
              </Grid2>
              <Grid2 size="auto">
                <Typography>{category.frequency}</Typography>
              </Grid2>
            </Grid2>
          ))}
        <Grid2 container direction="row" alignItems="center" sx={{ mt: 1 }}>
          <Grid2 size={2}></Grid2>
          <Grid2
            display={"flex"}
            size="grow"
            sx={{ justifyContent: "flex-end", mr: 1 }}
          >
            <Typography sx={{ fontSize: 12 }}>
              {t("legend_remaining")}:
            </Typography>
          </Grid2>
          <Grid2 size="auto">
            <Typography sx={{ fontSize: 12 }}>
              {categories.slice(64).length}
            </Typography>
          </Grid2>
        </Grid2>
      </Stack>
    </div>
  );
}
