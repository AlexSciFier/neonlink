import React, { useState } from "react";
import InputGroup from "../../components/inputGroup";
import SwitchButton from "../../components/SwitchButton";
import {
  fetchUserSettings,
  persistUserSettings,
  userSettingsKeys,
  useUserSettingsStore,
} from "../../../../stores/userSettingsStore";
import {
  CARD_HEADER_STYLE,
  CARD_VERTICAL_ALIGMENT,
} from "../../../../helpers/constants";
import RadioButtonGroup from "../../../../components/RadioButtonGroup";
import InputItem from "../../components/inputItem";
import {
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
  LightBulbIcon,
  MoonIcon,
  PhotoIcon,
  ChevronUpDownIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import BackgroundImageSettings from "./BackgroundImageSettings";
import { useThemeContext } from "../../../../components/ThemeContext";
import SaveChangesDialog from "../../../../components/SaveChangesDialog";

export default function InterfaceTab() {
  const [useImageAsBg, setUseImageAsBg] = useUserSettingsStore(
    userSettingsKeys.UseBackgroundgImage
  );
  const [cardHeaderStyle, setCardHeaderStyle] = useUserSettingsStore(
    userSettingsKeys.CardHeaderStyle
  );
  const [openLinkInNewTab, setOpenLinkInNewTab] = useUserSettingsStore(
    userSettingsKeys.OpenLinkInNewTab
  );
  const [useNeonShadow, setUseNeonShadow] = useUserSettingsStore(
    userSettingsKeys.UseNeonShadows
  );
  const [cardVerticalAligment, setCardVerticalAligment] = useUserSettingsStore(
    userSettingsKeys.CardVerticalAligment
  );
  const [columns, setColumns] = useUserSettingsStore(userSettingsKeys.Columns);
  const [maxItemsInList, setMaxItemsInList] = useUserSettingsStore(
    userSettingsKeys.MaxItemsInLinks
  );
  const { theme, setTheme } = useThemeContext();

  const [isChanged, setIsChanged] = useState(false);

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
          icon: <ArrowTopRightOnSquareIcon />,
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
          description: "Use image url as background of dashboard",
          icon: <PhotoIcon />,
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
          title: "Background image",
          description: "Upload or choose background image",
          icon: <PhotoIcon />,
          horisontal: true,
          input: <BackgroundImageSettings />,
        },
        {
          title: "Columns",
          description: "Number of columns in dashboard",
          icon: <ViewColumnsIcon />,
          input: (
            <select
              id="dashboard-columns"
              defaultValue={columns}
              className="rounded border w-full focus:outline-none focus:ring-cyan-600 focus:ring px-4 py-2 bg-transparent dark:text-white"
              onChange={(e) => setColumns(e.target.value)}
            >
              {[...Array(Number.parseInt(6))].map((i, idx) => (
                <option
                  className="dark:text-white dark:bg-gray-900"
                  key={idx}
                  value={idx + 1}
                >
                  {idx + 1}
                </option>
              ))}
            </select>
          ),
        },
        {
          title: "Card style",
          description: "Change style of card header in dashboard",
          icon: <Squares2X2Icon />,
          input: (
            <RadioButtonGroup
              options={CARD_HEADER_STYLE}
              name={"card-header"}
              title={""}
              onChange={(e) => setCardHeaderStyle(e.target.value)}
              defaultValue={cardHeaderStyle || CARD_HEADER_STYLE[0]}
            />
          ),
        },
        {
          title: "Enable neon shadows",
          description: "Enable colored shadow under cards in dashboard",
          icon: <LightBulbIcon />,
          input: (
            <SwitchButton
              id={"use-neon-shadow"}
              name={"use-neon-shadow"}
              text={""}
              checked={useNeonShadow}
              onChange={(e) => setUseNeonShadow(e.target.checked)}
            />
          ),
        },
        {
          title: "Card position",
          description: "Card vertical aligment",
          icon: <ChevronUpDownIcon />,
          input: (
            <RadioButtonGroup
              options={CARD_VERTICAL_ALIGMENT}
              name={"card-aligment"}
              title={""}
              onChange={(e) => setCardVerticalAligment(e.target.value)}
              defaultValue={cardVerticalAligment || CARD_VERTICAL_ALIGMENT[0]}
            />
          ),
        },
      ],
    },
  ];

  async function saveChanges(e) {
    e.preventDefault();
    await persistUserSettings();
    setIsChanged(false);
  }

  async function undoChanges(e) {
    e.preventDefault();
    await fetchUserSettings();
    setIsChanged(false);
  }

  return (
    <form onChange={() => setIsChanged(true)} className="space-y-6">
      {settings.map((setting) => (
        <InputGroup title={setting.title} key={setting.title}>
          {setting.items.map((item) => (
            <InputItem
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              input={item.input}
              horisontal={item?.horisontal}
            />
          ))}
        </InputGroup>
      ))}
      {isChanged && (
        <SaveChangesDialog
          saveChanges={saveChanges}
          undoChanges={undoChanges}
        />
      )}
    </form>
  );
}
