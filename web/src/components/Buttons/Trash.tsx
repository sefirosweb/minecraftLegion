import React from "react"
import { Button } from "react-bootstrap"
import { BsTrash } from "react-icons/bs"

interface CustomProps {
}

type Props = CustomProps & React.ComponentProps<typeof Button>;

export const Trash: React.FC<Props> = (props) => {
  const { className, ...rest } = props
  return (
    <Button variant="danger" className={`p-1 $ ${className}`} size="sm" {...rest}>
      <BsTrash size={20} />
    </Button>
  )
}
