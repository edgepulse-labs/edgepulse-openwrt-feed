include $(TOPDIR)/rules.mk

PKG_NAME:=psimd
PKG_VERSION:=4674816f56757dbd99b297cb5647f2520df08db1
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/snest/psimd/tar.gz/$(PKG_VERSION)?
PKG_HASH:=8934a8dff062663331a17588dfb771940be9d22887596c8ca77e25026c2adc6f

PKG_LICENSE:=MIT
PKG_LICENSE_FILES:=LICENSE

CMAKE_INSTALL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/psimd
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=Portable 128-bit SIMD intrinsics
  URL:=https://github.com/snest/psimd
endef

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

$(eval $(call BuildPackage,psimd))
