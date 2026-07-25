package {{ package_name }};

import org.slf4j.Logger;

import com.mojang.logging.LogUtils;

import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.chat.Component;
import net.minecraft.world.food.FoodProperties;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.CreativeModeTab;
import net.minecraft.world.item.CreativeModeTabs;
import net.minecraft.world.item.Item;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.material.MapColor;
import net.neoforged.api.distmarker.Dist;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.fml.common.Mod;
import net.neoforged.fml.config.ModConfig;
{{ #from_1_20_5 }}
import net.neoforged.fml.ModContainer;
{{ /from_1_20_5 }}
{{ #before_1_21_1 }}
{{ #before_1_20_5 }}
import net.neoforged.fml.ModLoadingContext;
import net.neoforged.fml.common.Mod.EventBusSubscriber;
{{ /before_1_20_5 }}
{{ #from_1_20_5 }}
import net.neoforged.fml.common.EventBusSubscriber;
{{ /from_1_20_5 }}
import net.neoforged.fml.event.lifecycle.FMLClientSetupEvent;
import net.minecraft.client.Minecraft;
{{ /before_1_21_1 }}
import net.neoforged.fml.event.lifecycle.FMLCommonSetupEvent;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.BuildCreativeModeTabContentsEvent;
import net.neoforged.neoforge.event.server.ServerStartingEvent;
import net.neoforged.neoforge.registries.DeferredBlock;
import net.neoforged.neoforge.registries.DeferredHolder;
import net.neoforged.neoforge.registries.DeferredItem;
import net.neoforged.neoforge.registries.DeferredRegister;

{{ ^disableComments }}
// The value here should match an entry in the META-INF/{{ mods_toml_file }} file
{{ /disableComments }}
@Mod({{ mod_class_name }}.MODID)
public class {{ mod_class_name }} {
{{ ^disableComments }}
    // Define mod id in a common place for everything to reference
{{ /disableComments }}
    public static final String MODID = "{{ mod_id }}";
{{ ^disableComments }}
    // Directly reference a slf4j logger
{{ /disableComments }}
    public static final Logger LOGGER = LogUtils.getLogger();
{{ ^disableComments }}
    // Create a Deferred Register to hold Blocks which will all be registered under the "{{ mod_id }}" namespace
{{ /disableComments }}
    public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks(MODID);
{{ ^disableComments }}
    // Create a Deferred Register to hold Items which will all be registered under the "{{ mod_id }}" namespace
{{ /disableComments }}
    public static final DeferredRegister.Items ITEMS = DeferredRegister.createItems(MODID);
{{ ^disableComments }}
    // Create a Deferred Register to hold CreativeModeTabs which will all be registered under the "{{ mod_id }}" namespace
{{ /disableComments }}
    public static final DeferredRegister<CreativeModeTab> CREATIVE_MODE_TABS = DeferredRegister.create(Registries.CREATIVE_MODE_TAB, MODID);

{{ ^disableComments }}
    // Creates a new Block with the id "{{ mod_id }}:example_block", combining the namespace and path
{{ /disableComments }}
{{ #before_1_21_10 }}
    public static final DeferredBlock<Block> EXAMPLE_BLOCK = BLOCKS.registerSimpleBlock("example_block", BlockBehaviour.Properties.of().mapColor(MapColor.STONE));
{{ /before_1_21_10 }}
{{ #from_1_21_10 }}
    public static final DeferredBlock<Block> EXAMPLE_BLOCK = BLOCKS.registerSimpleBlock("example_block", p -> p.mapColor(MapColor.STONE));
{{ /from_1_21_10 }}
{{ ^disableComments }}
    // Creates a new BlockItem with the id "{{ mod_id }}:example_block", combining the namespace and path
{{ /disableComments }}
    public static final DeferredItem<BlockItem> EXAMPLE_BLOCK_ITEM = ITEMS.registerSimpleBlockItem("example_block", EXAMPLE_BLOCK);

{{ ^disableComments }}
    // Creates a new food item with the id "{{ mod_id }}:example_id", nutrition 1 and saturation 2
{{ /disableComments }}
{{ #before_1_21_10 }}
    public static final DeferredItem<Item> EXAMPLE_ITEM = ITEMS.registerSimpleItem("example_item", new Item.Properties().food(new FoodProperties.Builder()
{{ #before_1_20_5 }}
            .alwaysEat().nutrition(1).saturationMod(2f).build()));
{{ /before_1_20_5 }}
{{ #from_1_20_5 }}
            .alwaysEdible().nutrition(1).saturationModifier(2f).build()));
{{ /from_1_20_5 }}
{{ /before_1_21_10 }}
{{ #from_1_21_10 }}
    public static final DeferredItem<Item> EXAMPLE_ITEM = ITEMS.registerSimpleItem("example_item", p -> p.food(new FoodProperties.Builder()
            .alwaysEdible().nutrition(1).saturationModifier(2f).build()));
{{ /from_1_21_10 }}

{{ ^disableComments }}
    // Creates a creative tab with the id "{{ mod_id }}:example_tab" for the example item, that is placed after the combat tab
{{ /disableComments }}
    public static final DeferredHolder<CreativeModeTab, CreativeModeTab> EXAMPLE_TAB = CREATIVE_MODE_TABS.register("example_tab", () -> CreativeModeTab.builder()
            .title(Component.translatable("itemGroup.{{ mod_id }}")) {{ ^disableComments }}//The language key for the title of your CreativeModeTab{{ /disableComments }}
            .withTabsBefore(CreativeModeTabs.COMBAT)
            .icon(() -> EXAMPLE_ITEM.get().getDefaultInstance())
            .displayItems((parameters, output) -> {
                output.accept(EXAMPLE_ITEM.get());{{ ^disableComments }}// Add the example item to the tab. For your own tabs, this method is preferred over the event{{ /disableComments }}
            }).build());

{{ ^disableComments }}
    // The constructor for the mod class is the first code that is run when your mod is loaded.
    // FML will recognize some parameter types like IEventBus or ModContainer and pass them in automatically.
{{ /disableComments }}
{{ #before_1_20_5 }}
    public {{ mod_class_name }}(IEventBus modEventBus) {
{{ /before_1_20_5 }}
{{ #from_1_20_5 }}
    public {{ mod_class_name }}(IEventBus modEventBus, ModContainer modContainer) {
{{ /from_1_20_5 }}
{{ ^disableComments }}
        // Register the commonSetup method for modloading
{{ /disableComments }}
        modEventBus.addListener(this::commonSetup);

{{ ^disableComments }}
        // Register the Deferred Register to the mod event bus so blocks get registered
{{ /disableComments }}
        BLOCKS.register(modEventBus);
{{ ^disableComments }}
        // Register the Deferred Register to the mod event bus so items get registered
{{ /disableComments }}
        ITEMS.register(modEventBus);
{{ ^disableComments }}
        // Register the Deferred Register to the mod event bus so tabs get registered
{{ /disableComments }}
        CREATIVE_MODE_TABS.register(modEventBus);

{{ ^disableComments }}
        // Register ourselves for server and other game events we are interested in.
        // Note that this is necessary if and only if we want *this* class ({{ mod_class_name }}) to respond directly to events.
        // Do not add this line if there are no @SubscribeEvent-annotated functions in this class, like onServerStarting() below.
{{ /disableComments }}
        NeoForge.EVENT_BUS.register(this);

{{ ^disableComments }}
        // Register the item to a creative tab
{{ /disableComments }}
        modEventBus.addListener(this::addCreative);

{{ ^disableComments }}
        // Register our mod's ModConfigSpec so that FML can create and load the config file for us
{{ /disableComments }}
{{ #before_1_20_5 }}
        ModLoadingContext.get().registerConfig(ModConfig.Type.COMMON, Config.SPEC);
{{ /before_1_20_5 }}
{{ #from_1_20_5 }}
        modContainer.registerConfig(ModConfig.Type.COMMON, Config.SPEC);
{{ /from_1_20_5 }}
    }

    private void commonSetup(FMLCommonSetupEvent event) {
{{ ^disableComments }}
        // Some common setup code
{{ /disableComments }}
        LOGGER.info("HELLO FROM COMMON SETUP");

        if (Config.LOG_DIRT_BLOCK.getAsBoolean()) {
            LOGGER.info("DIRT BLOCK >> {}", BuiltInRegistries.BLOCK.getKey(Blocks.DIRT));
        }

        LOGGER.info("{}{}", Config.MAGIC_NUMBER_INTRODUCTION.get(), Config.MAGIC_NUMBER.getAsInt());

        Config.ITEM_STRINGS.get().forEach((item) -> LOGGER.info("ITEM >> {}", item));
    }

{{ ^disableComments }}
    // Add the example block item to the building blocks tab
{{ /disableComments }}
    private void addCreative(BuildCreativeModeTabContentsEvent event) {
        if (event.getTabKey() == CreativeModeTabs.BUILDING_BLOCKS) {
            event.accept(EXAMPLE_BLOCK_ITEM);
        }
    }

{{ ^disableComments }}
    // You can use SubscribeEvent and let the Event Bus discover methods to call
{{ /disableComments }}
    @SubscribeEvent
    public void onServerStarting(ServerStartingEvent event) {
{{ ^disableComments }}
        // Do something when the server starts
{{ /disableComments }}
        LOGGER.info("HELLO from server starting");
    }
{{ #before_1_21_1 }}

{{ ^disableComments }}
    // You can use EventBusSubscriber to automatically register all static methods in the class annotated with @SubscribeEvent
{{ /disableComments }}
    @EventBusSubscriber(modid = {{ mod_class_name }}.MODID, bus = EventBusSubscriber.Bus.MOD, value = Dist.CLIENT)
    static class ClientModEvents {
        @SubscribeEvent
        static void onClientSetup(FMLClientSetupEvent event) {
{{ ^disableComments }}
            // Some client setup code
{{ /disableComments }}
            LOGGER.info("HELLO FROM CLIENT SETUP");
            LOGGER.info("MINECRAFT NAME >> {}", Minecraft.getInstance().getUser().getName());
        }
    }
{{ /before_1_21_1 }}
}
