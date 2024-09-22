import { Button } from "@mui/joy";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSnackbars } from "./Snackbars";
import { getActiveTab } from "extension/utils";

const { chrome } = window;

export const CopyToClipboardButton = ({
  value,
  message,
  children,
  variant = "plain",
  ...props
}) => {
  const { showSnackbar } = useSnackbars();

  return (
    <Button
      variant={variant}
      {...props}
      onClick={async () => {
        /*
         * For DevTools panels navigator.clipboard.writeText() does not work
         * even with clipboardWrite permission.
         *
         * So, using a deprecated document.execCommand("copy") for this.
         */
        function injectedFn(data) {
          const el = document.createElement("textarea");
          el.value = JSON.stringify(data, null, 2);
          el.setAttribute("readonly", "");
          el.style.position = "absolute";
          el.style.left = "-9999px";
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
        }

        await chrome.scripting.executeScript({
          target: {
            tabId: chrome.devtools.inspectedWindow.tabId,
          },
          func: injectedFn,
          args: [value],
        });

        message && showSnackbar(message);
      }}
    >
      <ContentCopyIcon />
      {children}
    </Button>
  );
};
