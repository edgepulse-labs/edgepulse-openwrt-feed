include $(TOPDIR)/rules.mk

PKG_NAME:=tensorflow-lite-test
PKG_VERSION:=1.0
PKG_RELEASE:=1

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)
PKG_BUILD_DEPENDS:=tensorflow-lite flatbuffers

PKG_LICENSE:=Apache-2.0

include $(INCLUDE_DIR)/package.mk

define Package/tensorflow-lite-test
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=TensorFlow Lite runtime validation utility
  DEPENDS:=+tensorflow-lite +libstdcpp
endef

define Package/tensorflow-lite-test/description
 Small runtime validation utility that creates and loads a minimal TensorFlow
 Lite ADD model, runs inference, and checks the result.
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/tflite-runtime-check.cc $(PKG_BUILD_DIR)/
endef

define Build/Compile
	$(TARGET_CXX) $(TARGET_CPPFLAGS) $(TARGET_CXXFLAGS) -std=c++17 \
		-I$(STAGING_DIR)/usr/include \
		-I$(BUILD_DIR)/tensorflow-2.11.0 \
		-o $(PKG_BUILD_DIR)/tflite-runtime-check \
		$(PKG_BUILD_DIR)/tflite-runtime-check.cc \
		$(TARGET_LDFLAGS) -ltensorflow-lite
endef

define Package/tensorflow-lite-test/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/tflite-runtime-check $(1)/usr/bin/
endef

$(eval $(call BuildPackage,tensorflow-lite-test))
