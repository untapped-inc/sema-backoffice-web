// Used to get a specific settings item
export const getSettingsItem = (settings, itemName) => {
    return settings.reduce((final, settingsItem) => {
        if (settingsItem.name === itemName) return settingsItem;
        return final;
    }, {});
};