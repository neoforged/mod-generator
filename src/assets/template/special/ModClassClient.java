package {{ package_name }};

import net.neoforged.api.distmarker.Dist;
import net.neoforged.fml.ModContainer;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.client.gui.ConfigurationScreen;
import net.neoforged.neoforge.client.gui.IConfigScreenFactory;

// This class will not load on dedicated servers. Accessing client side code from here is safe.
@Mod(value = {{ mod_class_name }}.MODID, dist = Dist.CLIENT)
public class {{ mod_class_name }}Client {

    public {{ mod_class_name }}Client(ModContainer container) {

        // Allows NeoForge to create a config screen for this mod's configs.
        // Do not forget to add translations for your config options to the en_us.json file.
        container.registerExtensionPoint(IConfigScreenFactory.class, ConfigurationScreen::new);
    }
}