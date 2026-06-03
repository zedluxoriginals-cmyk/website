/*
  Turns raw audit_log action codes into plain store language for the activity
  feed. No technical terms — the operator reads "Product published", not
  "product.status active".
*/

function meta(metadata: Record<string, unknown> | null, key: string): string | null {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}

export function describeActivity(
  action: string,
  metadata: Record<string, unknown> | null,
): string {
  switch (action) {
    case "product.create":
      return `New product added${meta(metadata, "title") ? `: ${meta(metadata, "title")}` : ""}`;
    case "product.update":
      return `Product updated${meta(metadata, "title") ? `: ${meta(metadata, "title")}` : ""}`;
    case "product.status":
      return meta(metadata, "status") === "active"
        ? "Product published"
        : "Product unpublished";
    case "variant.stock":
      return "Stock updated";
    case "variant.create":
      return "Size/colour option added";
    case "variant.delete":
      return "Size/colour option removed";
    case "image.add":
      return "Photo added";
    case "image.primary":
      return "Main photo changed";
    case "image.delete":
      return "Photo removed";
    case "image.reorder":
      return "Photos reordered";
    case "order.status": {
      const status = meta(metadata, "status");
      return status ? `Order marked ${status}` : "Order status changed";
    }
    case "order.tracking":
      return "Order tracking updated";
    case "message.status":
      return `Message marked ${meta(metadata, "status") ?? "updated"}`;
    case "settings.update":
      return "Store settings updated";
    case "homepage.featured":
      return metadata?.featured ? "Added to featured" : "Removed from featured";
    case "homepage.badge":
      return "Homepage placement changed";
    default:
      return action.replace(/[._]/g, " ");
  }
}
