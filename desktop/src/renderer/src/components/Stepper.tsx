import { Stack, Typography } from "@mui/material";
import { ArrowForward as ArrowRightIcon } from "@mui/icons-material";

type Props = {
  items: string[];
  currentIndex: number;
};

export const Stepper = ({ items, currentIndex }: Props): JSX.Element => {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {items.map((item, index) => (
        <Stack key={`${index}-${item}`} direction="row" alignItems="center">
          {/* Item text */}
          <Typography
            sx={{
              background:
                currentIndex === index
                  ? "#5595D9"
                  : currentIndex > index
                  ? "#D1CFCD"
                  : "#F3F2F1",
              color:
                currentIndex > index || currentIndex === index
                  ? "white"
                  : "#2D2D2D",
              borderRadius: "10px",
              paddingX: 1,
              fontSize: "0.75rem",
            }}
          >
            {item}
          </Typography>

          {/* Arrow icon */}
          {index < items.length - 1 && (
            <ArrowRightIcon
              sx={{
                marginLeft: 1,
                fontSize: "1rem",
                color: "#9F9D9C",
              }}
            />
          )}
        </Stack>
      ))}
    </Stack>
  );
};
