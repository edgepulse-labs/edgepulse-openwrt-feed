include $(TOPDIR)/rules.mk

PKG_NAME:=litert-test
PKG_VERSION:=1.0
PKG_RELEASE:=1

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)
PKG_BUILD_DEPENDS:=litert flatbuffers

PKG_LICENSE:=Apache-2.0

include $(INCLUDE_DIR)/package.mk

define Package/litert-test
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=LiteRT runtime validation utility
  DEPENDS:=+litert +libstdcpp
endef

define Package/litert-test/description
 Small runtime validation utility that creates and loads a minimal ADD model,
 runs inference through libLiteRt, and checks the result.
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/litert-runtime-check.cc $(PKG_BUILD_DIR)/
endef

define Build/Compile
	$(TARGET_CXX) $(TARGET_CPPFLAGS) $(TARGET_CXXFLAGS) -std=c++17 \
		-DFLATBUFFERS_LOCALE_INDEPENDENT=0 \
		-I$(BUILD_DIR)/LiteRT-2.1.4/flatbuffers/include \
		-I$(BUILD_DIR)/LiteRT-2.1.4/tflite \
		-I$(BUILD_DIR)/LiteRT-2.1.4/tensorflow-source \
		-I$(STAGING_DIR)/usr/include \
		-o $(PKG_BUILD_DIR)/litert-runtime-check \
		$(PKG_BUILD_DIR)/litert-runtime-check.cc \
		$(TARGET_LDFLAGS) -lLiteRt
endef

define Package/litert-test/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/litert-runtime-check $(1)/usr/bin/
endef

$(eval $(call BuildPackage,litert-test))
