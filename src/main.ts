import { Plugin, Notice, App, PluginSettingTab, Setting } from 'obsidian';

// Bypass TypeScript strict type checking for Node.js modules
declare const require: any;
const { exec } = require('child_process');

interface BatchButtonSettings {
    textColor: string;
    borderWidth: string;
    borderColor: string;
    scale: string;
    defaultJustify: string;
    borderRadius: string;
}

const DEFAULT_SETTINGS: BatchButtonSettings = {
    textColor: 'var(--text-accent)',
    borderWidth: '1px',
    borderColor: 'var(--background-modifier-border)',
    scale: '1',
    defaultJustify: 'centre',
    borderRadius: "0.3"
};

export default class BatchButtonPlugin extends Plugin {
    settings: BatchButtonSettings;

    async onload() {
        await this.loadSettings();
        
        // Expose our new UI in the Obsidian settings panel
        this.addSettingTab(new BatchButtonSettingTab(this.app, this));

        this.registerMarkdownCodeBlockProcessor("batchbutton", (source, el, ctx) => {
            const lines = source.split('\n');
            let label = "Execute";
            let command = "";
            let justify = this.settings.defaultJustify;

            // Parse the code block parameters
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("label:")) label = trimmed.substring(6).trim();
                if (trimmed.startsWith("command:")) command = trimmed.substring(8).trim();
                if (trimmed.startsWith("justify:")) justify = trimmed.substring(8).trim().toLowerCase();
            }

            // Create a flex container to handle alignment
            const container = el.createEl("div");
            container.style.display = "flex";
            container.style.width = "100%";
            
            // Handle justification
            if (justify === "center" || justify === "centre") container.style.justifyContent = "center";
            else if (justify === "right") container.style.justifyContent = "flex-end";
            else container.style.justifyContent = "flex-start";

            // Render the button into the container
            const btn = container.createEl("button", { text: label });

            // Apply the aesthetic styling dynamically from settings
            btn.style.backgroundColor = "transparent";
            btn.style.border = `${this.settings.borderWidth} solid ${this.settings.borderColor}`;
            btn.style.color = this.settings.textColor;
            btn.style.cursor = "pointer";
            btn.style.fontWeight = "500";
            btn.style.boxShadow = "none";

            // Use native CSS flow scaling instead of transform to prevent clipping
            const scaleFactor = parseFloat(this.settings.scale) || 1;
            const borderRadius = parseFloat(this.settings.borderRadius)
            btn.style.fontSize = `${scaleFactor}em`;
            btn.style.padding = `${0.4 * scaleFactor}em ${1.5 * scaleFactor}em`; 
            btn.style.borderRadius = `${borderRadius * 0.5}em`; 

            // Hover effects
            btn.addEventListener("mouseenter", () => btn.style.backgroundColor = "var(--background-modifier-hover)");
            btn.addEventListener("mouseleave", () => btn.style.backgroundColor = "transparent");

            // Resolve the absolute Windows path of the current note
            // @ts-ignore (Bypasses TS warning for internal Obsidian API)
            const basePath = this.app.vault.adapter.getBasePath();
            const absoluteFilePath = require('path').join(basePath, ctx.sourcePath);

            // Replace the magic variable with the wrapped file path
            const finalCommand = command.replace(/%file%/ig, `"${absoluteFilePath}"`);

            // Execution logic
            btn.onclick = () => {
                if (!finalCommand) {
                    new Notice("BatchButton Error: No command specified.");
                    return;
                }

                new Notice(`Executing: ${label}...`);

                exec(finalCommand, { cwd: basePath }, (error: any, stdout: string, stderr: string) => {
                    if (error) {
                        console.error(`BatchButton Error: ${error.message}`);
                        return new Notice(`Failed to execute ${label}. Check developer console.`);
                    }
                    
                    if (stdout) console.log(stdout);
                    if (stderr) console.error(stderr);
                    
                    return new Notice(`${label} completed successfully!`);
                });
            };
        });
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

// --- SETTINGS UI ---

class BatchButtonSettingTab extends PluginSettingTab {
    plugin: BatchButtonPlugin;

    constructor(app: App, plugin: BatchButtonPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Text Colour')
            .setDesc('CSS value for the text colour (e.g. #FFFFFF, red, var(--text-accent)).')
            .addText(text => text
                .setPlaceholder('var(--text-accent)')
                .setValue(this.plugin.settings.textColor)
                .onChange(async (value) => {
                    this.plugin.settings.textColor = value || DEFAULT_SETTINGS.textColor;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Border Width')
            .setDesc('Thickness of the border (e.g. 1px, 2px).')
            .addText(text => text
                .setPlaceholder('1px')
                .setValue(this.plugin.settings.borderWidth)
                .onChange(async (value) => {
                    this.plugin.settings.borderWidth = value || DEFAULT_SETTINGS.borderWidth;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Border Colour')
            .setDesc('CSS value for the border colour.')
            .addText(text => text
                .setPlaceholder('var(--background-modifier-border)')
                .setValue(this.plugin.settings.borderColor)
                .onChange(async (value) => {
                    this.plugin.settings.borderColor = value || DEFAULT_SETTINGS.borderColor;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Button Scale')
            .setDesc('Multiplier for button size (1 = normal, 1.5 = 50% larger).')
            .addText(text => text
                .setPlaceholder('1')
                .setValue(this.plugin.settings.scale)
                .onChange(async (value) => {
                    this.plugin.settings.scale = value || '1';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default Justification')
            .setDesc('Where the button aligns if not specified in the markdown block.')
            .addDropdown(drop => drop
                .addOption('left', 'Left')
                .addOption('centre', 'Centre')
                .addOption('right', 'Right')
                .setValue(this.plugin.settings.defaultJustify)
                .onChange(async (value) => {
                    this.plugin.settings.defaultJustify = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName('Border Radius')
            .setDesc('Border Radius 0..1')
            .addText(text => text
                .setPlaceholder('0.5')
                .setValue(this.plugin.settings.borderRadius)
                .onChange(async (value) => {
                    this.plugin.settings.borderRadius = value || '0.5';
                    await this.plugin.saveSettings();
                }));
    }
}