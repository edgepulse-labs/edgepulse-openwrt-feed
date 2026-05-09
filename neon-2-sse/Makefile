include $(TOPDIR)/rules.mk

PKG_NAME:=neon-2-sse
PKG_VERSION:=662a85912e8f86ec808f9b15ce77f8715ba53316
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/intel/ARM_NEON_2_x86_SSE/tar.gz/$(PKG_VERSION)?
PKG_HASH:=bf46151b3b6dbf9e724d96e21f83f154251127bd1142e47cd0e1bf624cb579c3
PKG_BUILD_DIR:=$(BUILD_DIR)/ARM_NEON_2_x86_SSE-$(PKG_VERSION)

PKG_LICENSE:=BSD-2-Clause
PKG_LICENSE_FILES:=LICENSE

CMAKE_INSTALL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/neon-2-sse
  SECTION:=libs
  CATEGORY:=Libraries
  TITLE:=ARM NEON intrinsics compatibility for x86 SSE
  URL:=https://github.com/intel/ARM_NEON_2_x86_SSE
endef

define Build/InstallDev
	$(call Build/InstallDev/cmake,$(1))
endef

$(eval $(call BuildPackage,neon-2-sse))
