include $(TOPDIR)/rules.mk

PKG_NAME:=ruy
PKG_VERSION:=83fd40d730feb0804fafbc2d8814bcc19a17b2e5
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/google/ruy/tar.gz/$(PKG_VERSION)?
PKG_HASH:=0bd02bef7675d3edd8168e6e4ce22e162516947fcc07bb79809be4cda8f27a0c

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE

CMAKE_INSTALL:=1
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/ruy
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=Matrix multiplication library for inference engines
  URL:=https://github.com/google/ruy
  DEPENDS:=+cpuinfo +libpthread +libstdcpp
endef

CMAKE_OPTIONS += \
	-DCMAKE_POSITION_INDEPENDENT_CODE=ON \
	-DRUY_FIND_CPUINFO=ON \
	-DRUY_MINIMAL_BUILD=ON

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

define Package/ruy/install
	$(INSTALL_DIR) $(1)/usr/lib
	$(CP) $(PKG_INSTALL_DIR)/usr/lib/libruy*.so* $(1)/usr/lib/ 2>/dev/null || true
endef

$(eval $(call BuildPackage,ruy))
