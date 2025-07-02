    // You can use EventBusSubscriber to automatically register all static methods in the class annotated with @SubscribeEvent
    {{ #before_1_21_1 }}
    @EventBusSubscriber(modid = MODID, bus = EventBusSubscriber.Bus.MOD, value = Dist.CLIENT)
    {{ /before_1_21_1 }}
    {{ #from_1_21_1 }}
    @EventBusSubscriber(modid = MODID, value = Dist.CLIENT)
    {{ /from_1_21_1 }}
    public static class ClientModEvents {
        @SubscribeEvent
        public static void onClientSetup(FMLClientSetupEvent event) {
            // Some client setup code
            LOGGER.info("HELLO FROM CLIENT SETUP");
            LOGGER.info("MINECRAFT NAME >> {}", Minecraft.getInstance().getUser().getName());
        }
    }
