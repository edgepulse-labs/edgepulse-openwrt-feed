include $(TOPDIR)/rules.mk

PKG_NAME:=fxdiv
PKG_VERSION:=63058eff77e11aa15bf531df5dd34395ec3017c8
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/Maratyszcza/FXdiv/tar.gz/$(PKG_VERSION)?
PKG_HASH:=ec74d882a0a47cfd9c0f95bc4fae9901a4ade802a96a3b76e02671bb7340a4c5
PKG_BUILD_DIR:=$(BUILD_DIR)/FXdiv-$(PKG_VERSION)

PKG_LICENSE:=MIT
PKG_LICENSE_FILES:=LICENSE

CMAKE_INSTALL:=1
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/fxdiv
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=Fixed-point inverse division headers
  URL:=https://github.com/Maratyszcza/FXdiv
endef

CMAKE_OPTIONS += \
	-DFXDIV_BUILD_TESTS=OFF \
	-DFXDIV_BUILD_BENCHMARKS=OFF

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

$(eval $(call BuildPackage,fxdiv))
