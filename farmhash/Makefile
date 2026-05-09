include $(TOPDIR)/rules.mk

PKG_NAME:=farmhash
PKG_VERSION:=0d859a811870d10f53a594927d0d0b97573ad06d
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/google/farmhash/tar.gz/$(PKG_VERSION)?
PKG_HASH:=18392cf0736e1d62ecbb8d695c31496b6507859e8c75541d7ad0ba092dc52115

PKG_LICENSE:=MIT
PKG_LICENSE_FILES:=COPYING

PKG_INSTALL:=1
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk

define Package/farmhash
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=Family of hash functions
  URL:=https://github.com/google/farmhash
  DEPENDS:=+libstdcpp
endef

TARGET_CXXFLAGS += -std=c++11

define Build/InstallDev
	$(INSTALL_DIR) $(1)/usr/include
	$(CP) $(PKG_INSTALL_DIR)/usr/include/farmhash.h $(1)/usr/include/
	$(INSTALL_DIR) $(1)/usr/lib
	$(CP) $(PKG_INSTALL_DIR)/usr/lib/libfarmhash.{a,so*} $(1)/usr/lib/ 2>/dev/null || true
endef

define Package/farmhash/install
	$(INSTALL_DIR) $(1)/usr/lib
	$(CP) $(PKG_INSTALL_DIR)/usr/lib/libfarmhash.so* $(1)/usr/lib/ 2>/dev/null || true
endef

$(eval $(call BuildPackage,farmhash))
