include $(TOPDIR)/rules.mk

PKG_NAME:=edgepulse
PKG_RELEASE:=1

ifeq ($(EDGEPULSE_LOCAL_SOURCE),)
PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/edgepulse-labs/edgepulse.git
PKG_SOURCE_VERSION:=HEAD
PKG_MIRROR_HASH:=skip
endif

PKG_LICENSE:=MIT
PKG_MAINTAINER:=edgepulse-labs

include $(INCLUDE_DIR)/package.mk

define Package/edgepulse
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=EdgePulse telemetry daemon
  DEPENDS:=+libsqlite3 +libubox +libubus +libblobmsg-json
endef

define Package/edgepulse/description
 EdgePulse collects local OpenWrt telemetry, stores raw samples in SQLite,
 derives feature windows, and exposes status/export helpers for LuCI.
endef

define Package/edgepulse/conffiles
/etc/config/edgepulse
endef

ifneq ($(EDGEPULSE_LOCAL_SOURCE),)
define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) $(EDGEPULSE_LOCAL_SOURCE)/. $(PKG_BUILD_DIR)/
	$(MAKE) -C $(PKG_BUILD_DIR) clean
endef
endif

define Build/Configure
endef

define Build/Compile
	$(MAKE) -C $(PKG_BUILD_DIR) \
		$(TARGET_CONFIGURE_OPTS) \
		CFLAGS="$(TARGET_CFLAGS)" \
		LDFLAGS="$(TARGET_LDFLAGS)"
endef

define Package/edgepulse/install
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/edgepulse $(1)/usr/sbin/edgepulse
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/etc/config/edgepulse $(1)/etc/config/edgepulse
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/etc/init.d/edgepulse $(1)/etc/init.d/edgepulse
endef

$(eval $(call BuildPackage,edgepulse))
