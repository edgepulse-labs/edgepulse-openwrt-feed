include $(TOPDIR)/rules.mk

PKG_NAME:=fp16
PKG_VERSION:=98b0a46bce017382a6351a19577ec43a715b6835
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/Maratyszcza/FP16/tar.gz/$(PKG_VERSION)?
PKG_HASH:=e7b509c76a2ea162ebdda77fb6b6f51f2f37dedee0866077d428e214516f0c2b
PKG_BUILD_DIR:=$(BUILD_DIR)/FP16-$(PKG_VERSION)

PKG_LICENSE:=MIT
PKG_LICENSE_FILES:=LICENSE

CMAKE_INSTALL:=1
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/fp16
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=Half-precision floating point conversion headers
  URL:=https://github.com/Maratyszcza/FP16
  DEPENDS:=+psimd
endef

CMAKE_OPTIONS += \
	-DFP16_BUILD_TESTS=OFF \
	-DFP16_BUILD_BENCHMARKS=OFF \
	-DPSIMD_SOURCE_DIR="$(STAGING_DIR)/usr"

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

$(eval $(call BuildPackage,fp16))
