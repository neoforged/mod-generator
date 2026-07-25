package {{ package_name }};

import net.minecraft.client.Minecraft;
import net.neoforged.api.distmarker.Dist;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.fml.ModContainer;
import net.neoforged.fml.common.EventBusSubscriber;
import net.neoforged.fml.common.Mod;
import net.neoforged.fml.event.lifecycle.FMLClientSetupEvent;
import net.neoforged.neoforge.client.gui.ConfigurationScreen;
import net.neoforged.neoforge.client.gui.IConfigScreenFactory;

{{ ^disableComments }}
// This class will not load on dedicated servers. Accessing client side code from here is safe.
{{ /disableComments }}
@Mod(value = {{ mod_class_name }}.MODID, dist = Dist.CLIENT)
{{ ^disableComments }}
// You can use EventBusSubscriber to automatically register all static methods in the class annotated with @SubscribeEvent
{{ /disableComments }}
@EventBusSubscriber(modid = {{ mod_class_name }}.MODID, value = Dist.CLIENT)
public class {{ mod_class_name }}Client {
    public {{ mod_class_name }}Client(ModContainer container) {
{{ ^disableComments }}
        // Allows NeoForge to create a config screen for this mod's configs.
        // The config screen is accessed by going to the Mods screen > clicking on your mod > clicking on config.
        // Do not forget to add translations for your config options to the en_us.json file.
{{ /disableComments }}
        container.registerExtensionPoint(IConfigScreenFactory.class, ConfigurationScreen::new);
    }

    @SubscribeEvent
    static void onClientSetup(FMLClientSetupEvent event) {
{{ ^disableComments }}
        // Some client setup code
{{ /disableComments }}
        {{ mod_class_name }}.LOGGER.info("HELLO FROM CLIENT SETUP");
        {{ mod_class_name }}.LOGGER.info("MINECRAFT NAME >> {}", Minecraft.getInstance().getUser().getName());
    }
}
