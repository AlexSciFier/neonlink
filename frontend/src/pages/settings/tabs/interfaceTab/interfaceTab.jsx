import React from "react";
import InputGroup from "../../components/inputGroup";
import SwitchButton from "../../components/SwitchButton";
import { useInterfaceSettings } from "../../../../context/interfaceSettingsContext";
import { useLocalStorage } from "../../../../hooks/useLocalStorage";
import {
  CARD_HEADER_STYLE,
  DEF_COLUMNS,
  DEF_MAX_ITEMS,
} from "../../../../helpers/constants";
import RadioButtonGroup from "../../../../components/RadioButtonGroup";
import InputItem from "../../components/inputItem";
import {
  BookmarkIcon,
  ExternalLinkIcon,
  MoonIcon,
  PhotographIcon,
  ViewBoardsIcon,
  ViewGridIcon,
} from "@heroicons/react/outline";

export default function InterfaceTab() {
  const {
    theme,
    setTheme,
    useImageAsBg,
    cardHeaderStyle,
    bgUrl,
    openLinkInNewTab,
    setUseImageAsBg,
    setBgUrl,
    setCardHeaderStyle,
    setOpenLinkInNewTab,
  } = useInterfaceSettings();

  const [columns, setColumns] = useLocalStorage(
    "dashboardColumns",
    DEF_COLUMNS
  );
  const [maxItemsInList, setMaxItemsInList] = useLocalStorage(
    "maxItemsInList",
    DEF_MAX_ITEMS
  );

  function changeTheme(e) {
    let isChecked = e.target.checked;
    if (isChecked) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  const settings = [
    {
      title: "Appearance",
      items: [
        {
          title: "Dark mode",
          description: "Switch dark mode",
          icon: <MoonIcon />,
          input: (
            <SwitchButton
              id={"dark-mode"}
              name={"dark-mode"}
              text={""}
              checked={theme === "dark"}
              onChange={(e) => changeTheme(e)}
            />
          ),
        },
      ],
    },
    {
      title: "Links page",
      items: [
        {
          title: "Maximum number of links",
          description: "Maximum numbers of links on one page",
          icon: <BookmarkIcon />,
          input: (
            <input
              type="number"
              min={10}
              max={50}
              value={maxItemsInList}
              onChange={(e) => setMaxItemsInList(e.target.value)}
              id="links-limit"
              className="rounded border w-full focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
            ></input>
          ),
        },
        {
          title: "Link in new tab",
          description: "Open link in new tab",
          icon: <ExternalLinkIcon />,
          input: (
            <SwitchButton
              id={"link-in-new-tab"}
              name={"link-in-new-tab"}
              text={""}
              checked={openLinkInNewTab}
              onChange={(e) => setOpenLinkInNewTab(e.target.checked)}
            />
          ),
        },
      ],
    },
    {
      title: "Dashboard",
      items: [
        {
          title: "Use image as background",
          description: "Use image url as background of dashboad",
          icon: <PhotographIcon />,
          input: (
            <SwitchButton
              id={"use-dashboard-bg"}
              name={"use-dashboard-bg"}
              text={""}
              checked={useImageAsBg}
              onChange={(e) => setUseImageAsBg(e.target.checked)}
            />
          ),
        },
        {
          title: "Backround image",
          description: "Url to background image",
          icon: <PhotographIcon />,
          input: (
            <input
              type={"url"}
              id="bg-image-url"
              placeholder="Link to image"
              onChange={(e) => setBgUrl(e.target.value)}
              value={bgUrl}
              className="rounded border w-full focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
            ></input>
          ),
        },
        {
          title: "Columns",
          description: "Number of columns in dashboard",
          icon: <ViewBoardsIcon />,
          input: (
            <select
              id="dashboard-columns"
              defaultValue={columns}
              className="rounded border w-full focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
              onChange={(e) => setColumns(e.target.value)}
            >
              {[...Array(Number.parseInt(6))].map((i, idx) => (
                <option className="dark:text-black" key={idx} value={idx + 1}>
                  {idx + 1}
                </option>
              ))}
            </select>
          ),
        },
        {
          title: "Card style",
          description: "Change style of card header in dashboard",
          icon: <ViewGridIcon />,
          input: (
            <RadioButtonGroup
              options={CARD_HEADER_STYLE}
              name={"card-header"}
              title={"Card header style"}
              onChange={(e) => setCardHeaderStyle(e.target.value)}
              defaultValue={cardHeaderStyle || CARD_HEADER_STYLE[0]}
            />
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {settings.map((setting) => (
        <InputGroup title={setting.title} key={setting.title}>
          {setting.items.map((item) => (
            <InputItem
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              input={item.input}
            />
          ))}
        </InputGroup>
      ))}
    </div>
  );
}
